import algosdk, { ABIContract, AtomicTransactionComposer, getMethodByName } from "algosdk";
import AbiJson from "../../artifacts/contract.json";
const AbiContract = new ABIContract(AbiJson);
interface IParams {
  params: algosdk.SuggestedParams;
  sender: string;
  arc34AppId: number;
  nonce: Uint8Array;
  otPK: Uint8Array;
  ct: Uint8Array;
  hash: Uint8Array;
}
/*
  nonce: abi.String, 
  otPK: abi.String, 
  ct: abi.String, 
  hash: abi.String
*/
const setEncryptedRecordTxs = (data: IParams): algosdk.Transaction[] => {
  const { sender, params, arc34AppId, nonce, otPK, ct, hash } = data;
  const signer = async () => [];
  const atc = new AtomicTransactionComposer();

  atc.addMethodCall({
    sender,
    signer,
    appID: arc34AppId,
    method: getMethodByName(AbiContract.methods, "setEncryptedRecord"),
    methodArgs: [nonce, otPK, ct, hash],
    suggestedParams: { ...params, flatFee: true, fee: 1000 },
    boxes: [{ appIndex: arc34AppId, name: algosdk.decodeAddress(sender).publicKey }],
  });
  const txs = atc.buildGroup().map(({ txn }) => {
    txn.group = undefined;
    return txn;
  });
  return txs;
};
export default setEncryptedRecordTxs;
