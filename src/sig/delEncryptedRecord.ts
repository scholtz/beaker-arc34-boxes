import algosdk from "algosdk";
import delEncryptedRecordTxs from "../txs/delEncryptedRecordTxs";
interface IInput {
  client: algosdk.Algodv2;
  sender: algosdk.Account;
  arc34AppId: number;
  nonce: Uint8Array;
  otPK: Uint8Array;
  ct: Uint8Array;
  hash: Uint8Array;
}
const delEncryptedRecord = async (data: IInput): Promise<number> => {
  const { client, sender, arc34AppId } = data;
  let params = await client.getTransactionParams().do();

  const txs = await delEncryptedRecordTxs({ arc34AppId, params, sender: sender.addr });
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
export default delEncryptedRecord;
