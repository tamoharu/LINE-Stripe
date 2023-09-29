export const checkout = () => {
    return {
        type: "flex",
        altText: "決済ページ",
        contents: {
            "type": "bubble",
            "size": "giga",
            "body": {
                "type": "box",
                "layout": "vertical",
                "spacing": "lg",
                "contents": [
                    priceBox(50, 120, process.env.PRICE_ID_50),
                    priceBox(320, 730, process.env.PRICE_ID_320),
                    priceBox(700, 1480, process.env.PRICE_ID_700),
                    priceBox(1720, 3600, process.env.PRICE_ID_1720),
                ]
            }
        }
    }
}

const priceBox = (point, price, priceId) => {
    return {
        "type": "box",
        "layout": "horizontal",
        "spacing": "none",
        "contents": [
            {
                "type": "text",
                "text": `🅿${point}`,
                "size": "md",
                "align": "start",
                "gravity": "center",
                "weight": "bold",
                "wrap": true,
                "margin": "none",
            },
            {
                "type": "button",
                "style": "primary",
                "height": "sm",
                "margin": "none",
                "gravity": "center",
                "action": {
                    "type": "postback",
                    "label": `¥${price}`,
                    "data": `priceID=${priceId}&point=${point}&price=${price}`
                }
            }
        ]
    }
}