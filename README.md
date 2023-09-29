# LINE-Stripe

### Required

- Node.js v18
- npm
- firebase
- ngrok
- Stripe

### .env

1. [LINE Developers](https://developers.line.biz/ja/)の管理画面からMessaging APIアカウントを作成し、アクセストークンとボットのベーシックIDをメモする

2. [Stripeの管理画面](https://dashboard.stripe.com)にアクセスし、テスト環境に変更したうえでシークレットキー、webhookの署名シークレット、商品のIDをメモする

3. [firebaseの管理画面](https://console.firebase.google.com)にアクセスし、 プロジェクトの設定 -> アプリの追加 からfirebaseConfigを取得する

### develop

1. .env.sampleを参考に.envファイルを作成する

2. firebaseプロジェクトを立ち上げる
```
$ firebase init functions
```

3. `functions/firebase.js`のfirebaseConfigを書き換える

### test

1. エミュレータを立ち上げる
```
$ firebase emulators:start
```

2. ngrokでトンネリングする
```
$ ngrok http 5001
```

3. エミュレータのurlの`http://localhost:5001`の部分をコンソールに表示されたngrokのurlに書き換える

4. LINEのwebhookに先程のurlに末尾`/webhook/line`を追加したものを設定する

5. Stripeのwebhookも同様に末尾`webhook/stripe`を追加したものを設定する

6. 動作確認してみる
テスト用のクレジットカードはカード番号4242424242424242、他の値は適当でOK

### deploy

1. Stripeを本番環境に変える

2. firebaseにデプロイする
```
$ firebase deploy --only functions
```

3. LINE, Stripeのwebhook urlをデプロイ後のものに書き換える