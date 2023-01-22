import algosdk, { Transaction } from "algosdk";
import * as fs from "fs";

interface IInput {
  deployerAccount: string;
  params: algosdk.SuggestedParams;
  client: algosdk.Algodv2;
}
const deployTxs = async (input: IInput): Promise<algosdk.Transaction[]> => {
  const { deployerAccount, params, client } = input;
  params.fee = 1000;
  params.flatFee = true;
  let appArgs: Uint8Array[] = [];

  const approvalProgramTeal = fs.readFileSync("./artifacts/approval.teal");

  //console.log("approvalProgramTeal", approvalProgramTeal);
  var approvalProgram = await client
    .compile(new Uint8Array(approvalProgramTeal))
    .do()
    .catch((e) => {
      expect(e).toBeFalsy();
      console.log("e", e);
    });
  let approvalProgramBytes = new Uint8Array(Buffer.from(approvalProgram.result, "base64"));

  const clearProgramTeal = fs.readFileSync("./artifacts/clear.teal");

  //console.log("approvalProgramTeal", approvalProgramTeal);
  var clearProgram = await client
    .compile(new Uint8Array(clearProgramTeal))
    .do()
    .catch((e) => {
      expect(e).toBeFalsy();
      console.log("e", e);
    });
  let clearProgramBytes = new Uint8Array(Buffer.from(clearProgram.result, "base64"));

  //let clearProgramBytes = new Uint8Array(Buffer.from("07810143", "hex"));

  // const budgetAppCall = algosdk.makeApplicationNoOpTxnFromObject({
  //   appIndex: dummyBudgetAppId,
  //   from: deployerAccount,
  //   suggestedParams: params,
  // });
  //console.log("approvalProgramBytes", approvalProgramBytes);
  //console.log("clearProgramBytes", clearProgramBytes);
  const tx1 = algosdk.makeApplicationCreateTxnFromObject({
    approvalProgram: approvalProgramBytes,
    clearProgram: clearProgramBytes,
    from: deployerAccount,
    numGlobalByteSlices: 2,
    numGlobalInts: 2,
    numLocalByteSlices: 0,
    numLocalInts: 0,
    extraPages: 0,
    suggestedParams: params,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    appArgs: appArgs,
    accounts: [],
    foreignApps: [],
    foreignAssets: [],
  });
  const toSignGrouped = algosdk.assignGroupID([tx1]);
  return toSignGrouped;
};
export default deployTxs;
