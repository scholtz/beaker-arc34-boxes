import algosdk from "algosdk";
import setup2ndRoundTxs from "../txs/setup2ndRoundTxs";
interface IInput {
  client: algosdk.Algodv2;
  sender: algosdk.Account;
  arc34AppId: number;
  encryptionSk: Uint8Array;
}
const setup2ndRound = async (data: IInput): Promise<string> => {
  const { client, sender, arc34AppId, encryptionSk } = data;
  let params = await client.getTransactionParams().do();

  const txs = await setup2ndRoundTxs({ arc34AppId, params, sender: sender.addr, encryptionSk });
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
export default setup2ndRound;
