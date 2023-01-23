# ARC34 Beaker smart contract with boxes

Submission for greenhouse 3 hack - https://gitcoin.co/issue/29662

https://www.youtube.com/watch?v=82dAYSNcnNs

AVMv8 added box storage to Algorand smart contracts. Box storage is a new way to store data on-chain and offers a lot of improvements over global and local storage. With box storage you can have an unlimited number of storage segments up to 32KB each. Beaker, a python framework for writing smart contracts, makes working with boxes seamless for developers. Using Beaker, write a smart contract that leverages box storage. Ideally, the smart contract should use box storage to accomplish something that isn't possible with global or local storage.

A valid submission will include the source code via a Github repository linked to your Gitcoin submission, a recorded demo and an article that explains how the application works. It is expected that most bounty challenges will be won by fully functioning submissions, however, in certain cases, where there is a higher degree of difficulty, projects and payouts will be assessed on progress made. The project submission deadline is 17:00 EST on February 8, 2023.

## How the application works

Application allows algorand foundation to deploy and configure the smart contract.

Configuration consists of selecting encryption address, end round of period 1 and end round of period 2. 

Each person who wish to receive grant for his projects has to submit request for grant. User submits the request in encrypted form using Curve25519XSalsa20Poly1305.

After end of round 1, foundation will publish encryption mnemonic so that all requester's forms are public and will decrypt each form.

Part of this solution is not the UI, but it cosists of full SDK api calls in typescript and high test coverage.

This solution demonstrates how to use boxes and not to rely on user to opt in into application. 

## Dependencies

First do

```
npm install
pip3 install git+https://github.com/algorand-devrel/beaker
pip3 install -r requirements.txt
```

## Env variables

Dev env:

```
source .env && export $(sed '/^#/d' .env | cut -d= -f1)
```

Test env:

```
source .env.test && export $(sed '/^#/d' .env.test | cut -d= -f1)
```

## Test solution with

```
./run.sh
```
