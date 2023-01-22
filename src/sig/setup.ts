import algosdk from "algosdk";
import setupTxs from "../txs/setupTxs";
interface IInput {
  client: algosdk.Algodv2;
  sender: algosdk.Account;
  arc34AppId: number;
  encryptionAddress: string;
  endOfFirstPhase: number;
  endOfSecondPhase: number;
}
const setup = async (data: IInput): Promise<string> => {
  const { client, sender, arc34AppId, encryptionAddress, endOfFirstPhase, endOfSecondPhase } = data;
  let params = await client.getTransactionParams().do();

  const txs = await setupTxs({
    arc34AppId,
    params,
    sender: sender.addr,
    encryptionAddress,
    endOfFirstPhase,
    endOfSecondPhase,
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
export default setup;
