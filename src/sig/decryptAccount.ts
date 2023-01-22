import algosdk from "algosdk";
import IArc34 from "../interface/IArc34";
import decryptAccountTxs from "../txs/decryptAccountTxs";
interface IInput {
  client: algosdk.Algodv2;
  sender: algosdk.Account;
  arc34AppId: number;
  account: string;
  arcData: IArc34;
}
const decryptAccount = async (data: IInput): Promise<number> => {
  const { client, sender, arc34AppId, account, arcData } = data;
  let params = await client.getTransactionParams().do();

  const txs = await decryptAccountTxs({
    arc34AppId,
    params,
    sender: sender.addr,
    account,
    arcData,
  });
  var signed = txs.map((tx) => tx.signTxn(sender.sk));

  const sendResult = await client
    .sendRawTransaction(signed)
    .do()
    .catch((e) => {
      expect(e).toBeFalsy();
      console.log("e", e);
      throw e;
    });
  return sendResult.txId;
};
export default decryptAccount;
