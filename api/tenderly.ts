import axios from "axios";
import { BigNumberish } from "ethers";
import dotenv from "dotenv";

dotenv.config();
const { TENDERLY_ACCESS_TOKEN } = process.env;

const SIMULATE_URL =
  "https://api.tenderly.co/api/v1/account/enso-finance/project/enso-shortcuts/simulate";
const BASE_SHARE_URL =
  "https://dashboard.tenderly.co/public/enso-finance/enso-shortcuts/simulator";
export async function simulate(
  network_id: number,
  from: string,
  to: string,
  data: string,
  value: BigNumberish
) {
  const transaction = {
    network_id,
    from,
    input: data,
    to,
    value,
    save: true,
  };

  const opts = {
    headers: {
      "X-Access-Key": TENDERLY_ACCESS_TOKEN,
    },
  };
  const resp = await axios.post(SIMULATE_URL, transaction, opts);
  return `${BASE_SHARE_URL}/${resp.data.simulation.id}`;
}
