import algosdk, { ABIContract, AtomicTransactionComposer, getMethodByName } from "algosdk";
import AbiJson from "../../artifacts/contract.json";
const AbiContract = new ABIContract(AbiJson);
interface IParams {
  params: algosdk.SuggestedParams;
  sender: string;
  arc34AppId: number;
}
/*
 no params.. delete from the tx sender
*/
const delEncryptedRecordTxs = (data: IParams): algosdk.Transaction[] => {
  const { sender, params, arc34AppId } = data;
  const signer = async () => [];
  const atc = new AtomicTransactionComposer();
  atc.addMethodCall({
    sender,
    signer,
    appID: arc34AppId,
    method: getMethodByName(AbiContract.methods, "delEncryptedRecord"),
    methodArgs: [],
    suggestedParams: { ...params, flatFee: true, fee: 1000 },
  });
  const txs = atc.buildGroup().map(({ txn }) => {
    txn.group = undefined;
    return txn;
  });
  return txs;
};
export default delEncryptedRecordTxs;
