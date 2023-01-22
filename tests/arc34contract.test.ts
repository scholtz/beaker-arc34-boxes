import algosdk, { waitForConfirmation } from "algosdk";
import decryptAccount from "../src/sig/decryptAccount";
import delEncryptedRecord from "../src/sig/delEncryptedRecord";
import deploy from "../src/sig/deploy";
import setEncryptedRecord from "../src/sig/setEncryptedRecord";
import setup2ndRoundTxs from "../src/sig/setup2ndRound";
import fundAccount from "../src/sig/fundAccount";
import setup from "../src/sig/setup";
import IArc34 from "../src/interface/IArc34";
import { setTimeout } from "timers/promises";
import setup2ndRound from "../src/sig/setup2ndRound";

const algodToken = <string>process.env.algodToken ?? "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const algodServer = <string>process.env.algodServer ?? "http://localhost";
const algodPort = <string>process.env.algodPort ?? 4001;
let client = new algosdk.Algodv2(algodToken, algodServer, algodPort);

const mnemonic: string = <string>process.env.mnemonic;
if (!mnemonic) throw Error("Setup env variables first");
let sender = algosdk.mnemonicToSecretKey(mnemonic);
let arc34AppId = parseInt(<string>process.env.arc34AppId ?? "0");
let encryptionAccount = algosdk.generateAccount();
let endOfFirstPhase = parseInt(<string>process.env.endOfFirstPhase ?? "0");
let endOfSecondPhase = parseInt(<string>process.env.endOfSecondPhase ?? "0");

describe("arc34contract.test", () => {
  beforeAll(async () => {
    if (!arc34AppId) {
      arc34AppId = await deploy({ client, sender });
      await fundAccount({ client, sender, receiver: algosdk.getApplicationAddress(arc34AppId), amount: 1000000 });
      const status = await client.status().do();
      const currentRound = status["last-round"];
      endOfFirstPhase = currentRound + 3;
      endOfSecondPhase = currentRound + 10;
      const setupTx = await setup({
        client,
        sender,
        arc34AppId,
        encryptionAddress: encryptionAccount.addr,
        endOfFirstPhase: currentRound + 3,
        endOfSecondPhase: currentRound + 10,
      });
      expect(setupTx).not.toBe("");
      console.log("setupTx", setupTx);
    }
  });
  it("app should be initialized", function () {
    expect(arc34AppId).not.toBe(0);
    expect(endOfFirstPhase).not.toBe(0);
    expect(endOfSecondPhase).not.toBe(0);
  });
  it("encrypt and decrypt", async function () {
    const arcData: IArc34 = {
      amount: 1,
      area: "area",
      category: "cat",
      company: "comp",
      details: "details",
      email: "email",
      experience: "high",
      pitchVideo: "url",
      roadmap: "soon",
      team: "great",
      title: "Test",
      url: "url",
    };
    const encTx = await setEncryptedRecord({
      client,
      sender,
      arc34AppId,
      encryptionAddress: encryptionAccount.addr,
      arcData,
    });

    await setup2ndRound({
      client,
      sender,
      arc34AppId,
      encryptionSk: encryptionAccount.sk,
    })
      .then((e) => {
        fail("Should throw exception");
      })
      .catch((e) => {
        console.log("e", e);
      });

    const status = await client.status().do();
    let currentRound = status["last-round"];
    while (currentRound < endOfFirstPhase) {
      console.log("currentRound", currentRound);
      await setTimeout(1000);
      const status2 = await client.status().do();
      currentRound = status2["last-round"];
    }

    const setup2ndRoundTx = await setup2ndRound({
      client,
      sender,
      arc34AppId,
      encryptionSk: encryptionAccount.sk,
    });

    console.log("setup2ndRoundTx", setup2ndRoundTx);

    const decryptAccountTx = await decryptAccount({
      client,
      sender,
      arc34AppId,
      account: sender.addr,
      arcData,
    });

    console.log("decryptAccountTx", decryptAccountTx);
  });
});
