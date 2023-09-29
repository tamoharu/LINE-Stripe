import { onRequest } from "firebase-functions/v2/https"
import express from 'express'
import bodyParser from 'body-parser'
import { lineEvent, stripeEvent } from './handler.js'


const app = express()

app.post('/webhook/line', async (req, res) => {
    const events = req.body.events
    try{
        await Promise.all(events.map(lineEvent))
        
        return res.status(200).json({
            status: "success",
        })
    } catch (error) {
        console.error('line post Error:', error)
        throw error
    }
})

app.post('/webhook/stripe', bodyParser.raw({ type: 'application/json' }), stripeEvent)


export const func = onRequest(
    {
        region: "asia-northeast1",
        cpu: 1,
        memory: "512MiB",
    },
    app
)