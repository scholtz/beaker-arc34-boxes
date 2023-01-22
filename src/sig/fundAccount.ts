import algosdk from "algosdk";
interface IParams {
  client: algosdk.Algodv2;
  sender: algosdk.Account;
  receiver: string;
  amount: number;
}
const fundAccount = async (input: IParams): Promise<string> => {
  const { client, sender, receiver, amount } = input;
  let params = await client.getTransactionParams().do();
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    amount: amount,
    from: sender.addr,
    to: receiver,
    suggestedParams: params,
  });
  const signedTx = txn.signTxn(sender.sk);
  const sendResult = await client
    .sendRawTransaction(signedTx)
    .do()
    .catch((e) => {
      expect(e).toBeFalsy();
      console.log("e", e);
    });
  console.log(`account ${receiver} funded`, sendResult);
  return sendResult.txId;
};

export default fundAccount;
