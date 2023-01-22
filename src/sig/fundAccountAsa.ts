import algosdk from "algosdk";
const fundAccountAsa = async (
  client: algosdk.Algodv2,
  sender: algosdk.Account,
  receiver: string,
  assetId: number,
  amount: number = 3000000
) => {
  let params = await client.getTransactionParams().do();
  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    amount: amount,
    from: sender.addr,
    to: receiver,
    assetIndex: assetId,
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
  console.log(`account ${receiver} funded with ${assetId}`, sendResult);
};

export default fundAccountAsa;
