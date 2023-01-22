import algosdk, { ABIContract, AtomicTransactionComposer, getMethodByName } from "algosdk";
import AbiJson from "../../artifacts/contract.json";
const AbiContract = new ABIContract(AbiJson);
interface IParams {
  params: algosdk.SuggestedParams;
  sender: string;
  arc34AppId: number;
  encryptionAddress: string;
  endOfFirstPhase: number;
  endOfSecondPhase: number;
}
/*
  encryptionAddress: abi.Account, 
  endOfFirstPhase: abi.Uint64, 
  endOfSecondPhase: abi.Uint64
*/
const setupTxs = (data: IParams): algosdk.Transaction[] => {
  const { sender, params, arc34AppId, encryptionAddress, endOfFirstPhase, endOfSecondPhase } = data;
  const signer = async () => [];
  const atc = new AtomicTransactionComposer();
  console.log("data", data);
  atc.addMethodCall({
    sender,
    signer,
    appID: arc34AppId,
    method: getMethodByName(AbiContract.methods, "setup"),
    methodArgs: [encryptionAddress, endOfFirstPhase, endOfSecondPhase],
    suggestedParams: { ...params, flatFee: true, fee: 1000 },
  });
  const txs = atc.buildGroup().map(({ txn }) => {
    txn.group = undefined;
    return txn;
  });
  return txs;
};
export default setupTxs;
