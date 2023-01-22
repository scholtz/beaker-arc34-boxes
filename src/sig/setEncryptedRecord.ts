import algosdk from "algosdk";
import IArc34 from "../interface/IArc34";
import setEncryptedRecordTxs from "../txs/setEncryptedRecordTxs";
import ed2curve from "ed2curve";
import nacl from "tweetnacl";
import sha256 from "crypto-js/sha256";
import CryptoJS from "crypto-js";
interface IInput {
  client: algosdk.Algodv2;
  sender: algosdk.Account;
  arc34AppId: number;
  arcData: IArc34;
  encryptionAddress: string;
}
const setEncryptedRecord = async (data: IInput): Promise<string> => {
  const { client, sender, arc34AppId, arcData, encryptionAddress } = data;
  let params = await client.getTransactionParams().do();
  const recipientPublicSignKey = algosdk.decodeAddress(encryptionAddress).publicKey;

  // Convert recipient's public signing key to crypto key
  const rcptPubKey = ed2curve.convertPublicKey(recipientPublicSignKey);
  // Let's use random KP and send the public part over the wire
  const otKeyPair = nacl.box.keyPair();
  // Let's agree on static nonce as we have ephemeral keys anyway
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const cipherText = nacl.box(Buffer.from(JSON.stringify(arcData)), nonce, rcptPubKey, otKeyPair.secretKey);
  const otPK = otKeyPair.publicKey;
  const ct = cipherText;
  const sep = new Uint8Array(Buffer.from(";"));
  var toHash = new Uint8Array([
    ...new Uint8Array(Buffer.from(arcData.title, "utf8")),
    ...sep,
    ...new Uint8Array(Buffer.from(arcData.email, "utf8")),
    ...sep,
    ...new Uint8Array(Buffer.from(arcData.company, "utf8")),
    ...sep,
    ...new Uint8Array(Buffer.from(arcData.team, "utf8")),
    ...sep,
    ...new Uint8Array(Buffer.from(arcData.experience, "utf8")),
    ...sep,
    ...new Uint8Array(Buffer.from(arcData.category, "utf8")),
    ...sep,
    ...new Uint8Array(Buffer.from(arcData.area, "utf8")),
    ...sep,
    ...algosdk.bigIntToBytes(arcData.amount, 8),
    ...sep,
    ...new Uint8Array(Buffer.from(arcData.roadmap, "utf8")),
    ...sep,
    ...new Uint8Array(Buffer.from(arcData.details, "utf8")),
    ...sep,
    ...new Uint8Array(Buffer.from(arcData.url, "utf8")),
    ...sep,
    ...new Uint8Array(Buffer.from(arcData.pitchVideo, "utf8")),
  ]);
  const toHashB = Buffer.from(toHash).toString("utf-8");
  // arcData.Title.get(),
  // Bytes(";"),
  // ProposerEmail.get(),
  // Bytes(";"),
  // CompanyName.get(),
  // Bytes(";"),
  // Team.get(),
  // Bytes(";"),
  // ExperienceOnAlgorand.get(),
  // Bytes(";"),
  // Category.get(),
  // Bytes(";"),
  // Area.get(),
  // Bytes(";"),
  // Itob(AmountRequested.get()),
  // Bytes(";"),
  // RoapMap.get(),
  // Bytes(";"),
  // Details.get(),
  // Bytes(";"),
  // URL.get(),
  // Bytes(";"),
  // PitchVideo.get()
  const hash = sha256(toHashB);
  let buffer = Buffer.from(hash.toString(CryptoJS.enc.hex), "hex");
  let hashArray = new Uint8Array(buffer);
  console.log("toHash", toHashB, Buffer.from(hashArray).toString("hex"));
  //console.log("toHash", toHash, hash, hashArray, Buffer.from(hashArray).toString("hex"));
  const txs = await setEncryptedRecordTxs({
    arc34AppId,
    params,
    sender: sender.addr,
    ct,
    hash: hashArray,
    nonce,
    otPK,
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
export default setEncryptedRecord;
