import axios from "axios";
import { BigNumberish } from "ethers";

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
      // Token will be invalid after 01.09.2023
      "X-Access-Key": "nhpAm5C6ip56u1GHKRqetZjPnFfqWJDc",
    },
  };
  const resp = await axios.post(SIMULATE_URL, transaction, opts);
  return `${BASE_SHARE_URL}/${resp.data.simulation.id}`;
}
