import algosdk from "algosdk";
import IArc34 from "../src/interface/IArc34";
import ed2curve from "ed2curve";
import nacl from "tweetnacl";

interface IMsg {
  ct: string;
  nonce: string;
  otPK: string;
}

describe("encryption.test", () => {
  beforeAll(async () => {});
  it("encrypt data and decrypt data", async function () {
    // SECURITY WARNING
    // Use encryption mnemonic for one time encryption purpose. Do not encrypt using existing mnemonics which holds algorand assets!
    // Do not store to the blockchain any long term encrypted data. Assume that in 100 years everything that is being encrypted will be decrypted. If stored on blockchain it is not possible to delete.

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
    const arcDataString = JSON.stringify(arcData);
    const encryptionAddress = algosdk.generateAccount();

    // encryption using public key of encryption address
    const recipientPublicSignKey = algosdk.decodeAddress(encryptionAddress.addr).publicKey;
    const rcptPubKey = ed2curve.convertPublicKey(recipientPublicSignKey);
    const otKeyPair = nacl.box.keyPair();
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const cipherText = nacl.box(Buffer.from(arcDataString), nonce, rcptPubKey, otKeyPair.secretKey);
    const data = JSON.stringify({
      ct: Buffer.from(cipherText).toString("base64"),
      nonce: Buffer.from(nonce).toString("base64"),
      otPK: Buffer.from(otKeyPair.publicKey).toString("base64"),
    });
    console.log(data);
    // decryption using private key of encryption address
    const rcptSecretKey = ed2curve.convertSecretKey(encryptionAddress.sk);
    const dataReceived: IMsg = JSON.parse(data);
    const dataUint8 = {
      ct: new Uint8Array(Buffer.from(dataReceived.ct, "base64")),
      nonce: new Uint8Array(Buffer.from(dataReceived.nonce, "base64")),
      otPK: new Uint8Array(Buffer.from(dataReceived.otPK, "base64")),
    };
    let decryptedBuffer = nacl.box.open(dataUint8.ct, dataUint8.nonce, dataUint8.otPK, rcptSecretKey);
    expect(decryptedBuffer).not.toBeNull();
    if (decryptedBuffer == null) decryptedBuffer = new Uint8Array(); // just to fix typescript type safety
    const decryptedData = Buffer.from(decryptedBuffer.buffer).toString("utf8");
    expect(decryptedData).toMatch(arcDataString);
  });
});
