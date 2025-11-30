# 🚀 Green Karma - Production Deployment Guide

This guide covers deploying Green Karma to production environments.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB production instance ready
- [ ] Polygon Mumbai/Mainnet RPC access
- [ ] IPFS/Pinata account configured
- [ ] Domain name registered (optional)
- [ ] SSL certificates ready
- [ ] Wallet with MATIC for gas fees

## 🔗 Blockchain Deployment

### Deploy to Polygon Mumbai Testnet

1. **Get MATIC tokens for Mumbai**
   - Visit [Mumbai Faucet](https://faucet.polygon.technology/)
   - Enter your wallet address
   - Receive test MATIC

2. **Configure environment**
   ```bash
   cd blockchain
   ```
   
   Edit `.env`:
   ```
   PRIVATE_KEY=your_actual_private_key
   POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
   ETHERSCAN_API_KEY=your_polygonscan_api_key
   ```

3. **Deploy contracts**
   ```bash
   npm run deploy:mumbai
   ```

4. **Save contract addresses**
   - Copy addresses from `blockchain/deployments/contracts.json`
   - Update backend and frontend environment variables

### Deploy to Polygon Mainnet

⚠️ **WARNING**: Mainnet deployment costs real money. Test thoroughly on Mumbai first.

1. **Get MATIC tokens**
   - Purchase MATIC from an exchange
   - Transfer to your deployment wallet

2. **Update configuration**
   ```
   POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
   ```

3. **Deploy**
   ```bash
   npm run deploy:polygon
   ```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Choose your region

2. **Configure access**
   - Add IP whitelist (0.0.0.0/0 for all IPs or specific IPs)
   - Create database user

3. **Get connection string**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/greenkarma?retryWrites=true&w=majority
   ```

4. **Update backend .env**
   ```
   MONGODB_URI=your_connection_string
   ```

## 🖥️ Backend Deployment

### Option 1: Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and initialize**
   ```bash
   railway login
   cd backend
   railway init
   ```

3. **Set environment variables**
   ```bash
   railway variables set MONGODB_URI="your_mongodb_uri"
   railway variables set JWT_SECRET="your_jwt_secret"
   railway variables set BLOCKCHAIN_RPC_URL="your_rpc_url"
   railway variables set BLOCKCHAIN_PRIVATE_KEY="your_private_key"
   railway variables set PINATA_API_KEY="your_pinata_key"
   railway variables set PINATA_SECRET_KEY="your_pinata_secret"
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Get deployment URL**
   ```bash
   railway domain
   ```

### Option 2: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login and create app**
   ```bash
   heroku login
   cd backend
   heroku create green-karma-api
   ```

3. **Set environment variables**
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_uri"
   heroku config:set JWT_SECRET="your_jwt_secret"
   heroku config:set BLOCKCHAIN_RPC_URL="your_rpc_url"
   heroku config:set BLOCKCHAIN_PRIVATE_KEY="your_private_key"
   heroku config:set PINATA_API_KEY="your_pinata_key"
   heroku config:set PINATA_SECRET_KEY="your_pinata_secret"
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 3: DigitalOcean App Platform

1. **Connect GitHub repository**
2. **Select backend folder**
3. **Configure environment variables** in the dashboard
4. **Deploy**

## 🌐 Frontend Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Set environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` - Your backend URL
   - `NEXT_PUBLIC_CHAIN_ID` - 80001 (Mumbai) or 137 (Polygon)
   - `NEXT_PUBLIC_RPC_URL` - Your RPC URL
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Your WalletConnect ID

4. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

4. **Configure environment variables** in Netlify dashboard

## 🔐 Security Hardening

### Backend Security

1. **Enable CORS properly**
   ```javascript
   app.use(cors({
     origin: ['https://your-frontend-domain.com'],
     credentials: true
   }));
   ```

2. **Rate limiting**
   ```bash
   npm install express-rate-limit
   ```
   
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   
   app.use('/api/', limiter);
   ```

3. **Helmet security headers**
   Already included in `server.js`

4. **Environment variables**
   - Never commit `.env` files
   - Use strong JWT secrets (32+ characters)
   - Rotate secrets regularly

### Smart Contract Security

1. **Audit contracts** before mainnet deployment
2. **Use OpenZeppelin** contracts (already implemented)
3. **Test thoroughly** on testnet
4. **Consider bug bounty** program

## 📊 Monitoring

### Backend Monitoring

1. **Setup logging**
   - Use Winston or Bunyan
   - Log to external service (LogDNA, Papertrail)

2. **Error tracking**
   - Sentry integration
   - Email alerts for critical errors

3. **Performance monitoring**
   - New Relic or DataDog
   - Monitor API response times

### Blockchain Monitoring

1. **Transaction monitoring**
   - Use Polygonscan API
   - Set up alerts for failed transactions

2. **Gas price monitoring**
   - Monitor gas costs
   - Optimize contract calls

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 🧪 Testing in Production

1. **Create test accounts**
2. **Submit test waste**
3. **Verify transactions on Polygonscan**
4. **Check token balances**
5. **Monitor error logs**

## 📈 Scaling Considerations

### Database

- Enable MongoDB indexes
- Use connection pooling
- Consider read replicas for high traffic

### Backend

- Use load balancer
- Enable horizontal scaling
- Cache frequently accessed data (Redis)

### Frontend

- Enable CDN (Vercel/Netlify automatic)
- Optimize images
- Code splitting (Next.js automatic)

## 🆘 Rollback Plan

1. **Keep previous deployment**
2. **Database backups** (automated with MongoDB Atlas)
3. **Contract upgrades** (use proxy pattern for future versions)
4. **Quick rollback** commands ready

## ✅ Post-Deployment Checklist

- [ ] All services running
- [ ] SSL certificates active
- [ ] Environment variables set
- [ ] Database connected
- [ ] Blockchain contracts deployed
- [ ] Test transactions successful
- [ ] Monitoring active
- [ ] Error tracking configured
- [ ] Backups enabled
- [ ] Documentation updated

## 🌍 Production URLs

After deployment, update these in your documentation:

- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-api.railway.app
- **Smart Contracts**: View on [Polygonscan](https://mumbai.polygonscan.com/)

## 📞 Support

For production issues:
1. Check logs first
2. Review error tracking (Sentry)
3. Check blockchain explorer
4. Verify environment variables
5. Test API endpoints manually

---

**Good luck with your deployment! 🚀**
