import express from 'express';
import cors from 'cors';
import { handleShipmentEtaWebhook } from './webhooks/shipment-eta';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/webhooks/shipment-eta', handleShipmentEtaWebhook);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`OffByOne API listening on port ${PORT}`);
});
