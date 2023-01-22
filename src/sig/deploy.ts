import algosdk from "algosdk";
import deployTxs from "../txs/deployTxs";
interface IInput {
  client: algosdk.Algodv2;
  sender: algosdk.Account;
}
const deploy = async (data: IInput): Promise<number> => {
  const { sender, client } = data;
  let params = await client.getTransactionParams().do();

  const txs = await deployTxs({ client, deployerAccount: sender.addr, params });
  var signed = txs.map((tx) => tx.signTxn(sender.sk));

  const sendResult = await client
    .sendRawTransaction(signed)
    .do()
    .catch((e) => {
      expect(e).toBeFalsy();
      console.log("e", e);
      throw e;
    });
  const response = await algosdk.waitForConfirmation(client, sendResult.txId, 4);
  return parseInt(response["application-index"]);
};
export default deploy;
