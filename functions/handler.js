import line from '@line/bot-sdk'
import Stripe from 'stripe'
import { config } from 'dotenv'
import { firestore } from './firebase.js'
import { checkout } from './flexMessage.js'

config()

const lineClient = new line.Client({ channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)


export const lineEvent = async (event) => {
    if(event.type === 'message'){
        if(event.message.text === '/shop'){
            return await lineClient.replyMessage(event.replyToken, checkout())
        }
    }
    else if(event.type === 'postback'){
        if(event.postback.data.startsWith("priceID")){
            return await handleStripePostback(event)
        }
    }
    else{
        return
    }
}


export const stripeEvent = async (req, res) => {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
    const sig = req.headers['stripe-signature']

    let event

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret)
    } catch (err) {
        console.error("Error constructing event:", err.message)
        return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    const lineId = event.data.object.metadata.lineID
    const docRef = firestore.doc(firestore.db, 'users', lineId)
    const userData = await firestore.getDoc(docRef).then(doc => doc.data())
 
    const point = userData?.point || 0
    const newPoint = point + Number(event.data.object.metadata.point)

    if (event.type === 'checkout.session.completed') {
        const docRef = firestore.doc(firestore.db, 'users', lineId)
        await firestore.setDoc(docRef, { point: newPoint }, { merge: true })
        await lineClient.pushMessage(lineId, {
            type: 'text',
            text: `決済が完了しました!`,
        })
    }

    return res.status(200).end()
}


const handleStripePostback = async (event) => {
    const userId = event.source.userId
    const queryString = event.postback.data
    const params = new URLSearchParams(queryString)

    const point = params.get('point')
    const priceId = params.get('priceID')

    const docRef = firestore.doc(firestore.db, 'users', userId)
    const userData = await firestore.getDoc(docRef).then(doc => doc.data())

    let customerId

    if (!userData?.stripeId) {
        const customer = await stripe.customers.create()
    
        customerId = customer.id
    
        try {
            await firestore.setDoc(docRef, { stripeId: customerId }, { merge: true })
        } 
        catch (setCustomerIdError) {
            console.error("setCustomerid Error:", setCustomerIdError)
            return { statusCode: 500, message: `setCustomerid Error: ${setCustomerIdError.message}` }
        }
    } 
    else {
        customerId = userData.stripeId
    }

    const mode = 'payment'
    const sessionConfig = {
        customer: customerId,
        mode: mode,
        line_items: [
            {
              price: priceId,
              quantity: 1,
            },
        ],
        success_url: `https://line.me/R/oaMessage/${process.env.LINE_BOT_ID}`,
        cancel_url: `https://line.me/R/oaMessage/${process.env.LINE_BOT_ID}`,
        allow_promotion_codes: true,
        metadata: { lineID: userId, point: point },
    }
    if (mode === 'payment') {
        sessionConfig.invoice_creation = { enabled: true }
    }

    let sessionUrl

    try {
        const session = await stripe.checkout.sessions.create(sessionConfig)
        sessionUrl = session.url
    }
    catch (error) {
        console.error('Stripe session creation failed:', error.message)
    }

    const checkoutMessage = {
        "type": "flex",
        "altText": "This is a Flex Message",
        "contents": {
          "type": "bubble",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "text",
                    "text": `${Number(point)}ポイント`,
                    "size": "lg",
                    "align": "center",
                    "weight": "bold"
                },
              {
                "type": "button",
                "action": {
                  "type": "uri",
                  "label": "決済画面を開く",
                  "uri": sessionUrl
                },
                "style": "primary"
              }
            ]
          }
        }
    }

    await lineClient.replyMessage(event.replyToken, checkoutMessage)
}