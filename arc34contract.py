from pyteal import *
from beaker import *
from typing import Final
from beaker.lib.storage import Mapping, List

# encoded ARC34 record https://github.com/scholtz/vote-coin-demo/blob/b88cdf21066d034c38095d15a999fe91eff30d4e/src/pages/vote/Question.vue#L744
class Arc34EncryptedRecord(abi.NamedTuple):
    nonce: abi.Field[abi.DynamicBytes]
    otPK: abi.Field[abi.DynamicBytes]
    cT: abi.Field[abi.DynamicBytes]
    hash: abi.Field[abi.DynamicBytes]

# https://github.com/algorandfoundation/ARCs/blob/3a621c99e0c53afa4f22a150b48b993f2d0a6dfa/ARCs/arc-0034.md
class Arc34DecodedRecord(abi.NamedTuple):
    Title: abi.Field[abi.String]
    ProposerEmail: abi.Field[abi.String]
    CompanyName: abi.Field[abi.String]
    Team: abi.Field[abi.String]
    ExperienceOnAlgorand: abi.Field[abi.String]
    Category: abi.Field[abi.String]
    Area: abi.Field[abi.String]
    AmountRequested: abi.Field[abi.Uint64]
    RoapMap: abi.Field[abi.String]
    Details: abi.Field[abi.String]
    URL: abi.Field[abi.String]
    PitchVideo: abi.Field[abi.String]

# Create a class, subclassing Application from beaker
class ARC34Application(Application):
    encryptionAddress: ApplicationStateValue = ApplicationStateValue(
        stack_type=TealType.bytes,
        descr="Encryption address. In first phase people will encrypt using the algoand address",
        static=True,
    )

    encryptionSk: ApplicationStateValue = ApplicationStateValue(
        stack_type=TealType.bytes,
        descr="Encryption mnemonic. In second phase deployer will public encryption mnemonic and decrypt all applications",
        static=True,
    )
    endOfFirstPhase: ApplicationStateValue = ApplicationStateValue(
        stack_type=TealType.uint64,
        descr="After this time it is not allowed to update the funding requests. Expressed in round number.",
        static=True,
    )
    endOfSecondPhase: ApplicationStateValue = ApplicationStateValue(
        stack_type=TealType.uint64,
        descr="After this time it is not allowed to vote on funding requests. Expressed in round number.",
        static=True,
    )
    encryptedRecords = Mapping(abi.Address, Arc34EncryptedRecord)
    decryptedRecords = Mapping(abi.Address, Arc34DecodedRecord)

    @create
    def create(self):
        return self.initialize_application_state()
    
    @external(authorize=Authorize.only(Global.creator_address()))
    def setup(
        self, 
        encryptionAddress: abi.Account, 
        endOfFirstPhase: abi.Uint64, 
        endOfSecondPhase: abi.Uint64
      ):
        self.encryptionAddress.set(encryptionAddress.address())
        self.endOfFirstPhase.set(endOfFirstPhase.get())
        self.endOfSecondPhase.set(endOfSecondPhase.get())
        return Seq(Approve())
    
    @external(authorize=Authorize.only(Global.creator_address()))
    def setup2ndRound(
        self, 
        encryptionSk: abi.String
      ):
        self.encryptionSk.set(encryptionSk.get())
        return Seq(
            Assert(Global.round() >= self.endOfFirstPhase.get()),
            #Assert(Global.round() < self.endOfSecondPhase.get()),
            Approve()
        )
    
    @external
    def setEncryptedRecord(
        self, 
        nonce: abi.DynamicBytes, 
        otPK: abi.DynamicBytes, 
        ct: abi.DynamicBytes, 
        hash: abi.DynamicBytes
      ):
        return Seq(
            #Assert( Global.round() <= self.endOfFirstPhase.get() ),
            (rec := Arc34EncryptedRecord()).set(nonce, otPK, ct, hash),
            self.encryptedRecords[Txn.sender()].set(rec),
            #Assert(hash.get() == Bytes('base16','70449ed5fc03ab86e83063afbcdc385e29ab1132b26e80a00c0a5dcffb3efabd')), 
            Approve()
        )
    
    @external
    def delEncryptedRecord(self):
        self.encryptedRecords[Txn.sender()].delete()
        return Seq(
            Assert(Global.round() <= self.endOfFirstPhase.get())
        )

    @external(authorize=Authorize.only(Global.creator_address()))
    def decryptAccount(
        self, 
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
    ):
        rec = Arc34EncryptedRecord()
        return Seq(
           #Assert(Global.round() > self.endOfFirstPhase.get()),
            #Assert(Global.round() <= self.endOfSecondPhase.get()),
            (self.encryptedRecords[account.address()].store_into(rec)),   
            (hash := abi.DynamicBytes()).set(Bytes('')),   
            (rec.hash.store_into(hash)),
            #Assert(hash.get() == Bytes('base16','70449ed5fc03ab86e83063afbcdc385e29ab1132b26e80a00c0a5dcffb3efabd')),                   
            Assert(Sha256(Concat(
                Title.get(), 
                Bytes(";"), 
                ProposerEmail.get(),
                Bytes(";"), 
                CompanyName.get(),
                Bytes(";"), 
                Team.get(),
                Bytes(";"), 
                ExperienceOnAlgorand.get(),
                Bytes(";"), 
                Category.get(),
                Bytes(";"), 
                Area.get(),
                Bytes(";"), 
                Itob(AmountRequested.get()),
                Bytes(";"), 
                RoapMap.get(),
                Bytes(";"), 
                Details.get(),
                Bytes(";"), 
                URL.get(),
                Bytes(";"), 
                PitchVideo.get() 
            )) == hash.get()),
            (dec := Arc34DecodedRecord()).set(
                Title, 
                ProposerEmail, 
                CompanyName, 
                Team, 
                ExperienceOnAlgorand, 
                Category, 
                Area, 
                AmountRequested, 
                RoapMap, 
                Details, 
                URL, 
                PitchVideo
            ),
            (self.decryptedRecords[Txn.sender()].set(dec)),
            Approve()
        )


def main():
    app=ARC34Application(version=8)
    app.dump('./artifacts')


if __name__ == "__main__":
    main()
