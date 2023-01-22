import algosdk, { ABIContract, AtomicTransactionComposer, getMethodByName } from "algosdk";
import AbiJson from "../../artifacts/contract.json";
import IArc34 from "../interface/IArc34";
const AbiContract = new ABIContract(AbiJson);
interface IParams {
  params: algosdk.SuggestedParams;
  sender: string;
  arc34AppId: number;
  account: string;
  arcData: IArc34;
}
/*
  account: abi.Account,
  Title: abi.String,
  ProposerEmail: abi.String,
  CompanyName: abi.String,
  Team: abi.String,
  ExperienceOnAlgorand: abi.String,
  Category: abi.String,
  Area: abi.String,
  AmountRequested: abi.Uint64,
  RoapMap: abi.String,
  Details: abi.String,
  URL: abi.String,
  PitchVideo: abi.String
*/
const decryptAccountTxs = (data: IParams): algosdk.Transaction[] => {
  const { sender, params, arc34AppId, account, arcData } = data;
  console.log("decryptAccountTxs", data);
  const signer = async () => [];
  const atc = new AtomicTransactionComposer();
  atc.addMethodCall({
    sender,
    signer,
    appID: arc34AppId,
    method: getMethodByName(AbiContract.methods, "decryptAccount"),
    methodArgs: [
      account,
      arcData.title,
      arcData.email,
      arcData.company,
      arcData.team,
      arcData.experience,
      arcData.category,
      arcData.area,
      arcData.amount,
      arcData.roadmap,
      arcData.details,
      arcData.url,
      arcData.pitchVideo,
    ],
    suggestedParams: { ...params, flatFee: true, fee: 1000 },
    boxes: [{ appIndex: arc34AppId, name: algosdk.decodeAddress(account).publicKey }],
  });
  const txs = atc.buildGroup().map(({ txn }) => {
    txn.group = undefined;
    return txn;
  });
  return txs;
};
export default decryptAccountTxs;
