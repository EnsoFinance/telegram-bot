dotenv.config();
const { TENDERLY_USER, TENDERLY_PROJECT, TENDERLY_ACCESS_KEY } = process.env;
import { axois } from 'axios'

const SIMULATE_API = `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/simulate`

async function execute(chainId, from, to, data, gasLimit, gasPrice, value) {
    const transaction = {
        network_id: '1',
        from: "0x0000000000000000000000000000000000000000",
        input: data,
        to,
        // tenderly specific
        save: true
    }

    const opts = {
        headers: {
            'X-Access-Key': process.env.TENDERLY_ACCESS_KEY || "",
        }
    const resp = await axios.post(SIMULATE_API, transaction, opts);
}
console.log(resp.data);