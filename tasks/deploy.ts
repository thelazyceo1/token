import { DeployerFn, } from "@ubeswap/hardhat-celo";
import { makeDeployTask } from "@ubeswap/hardhat-celo";
import * as path from "path";
import {DuniapayCFA__factory} from '../build/types'

const MINTER_ADDRESS = '0x284dC10d4C6ecB9EA1E95F8EE275073e0C0B401d'

const deployToken: DeployerFn<{
  DuniapayCFA: string;
}> = async ({deployer, deployCreate2}) => {
    const result = await deployCreate2("DuniapayCFA", {
      factory: DuniapayCFA__factory,
      args: [MINTER_ADDRESS],
      signer: deployer
    })
    return {
      DuniapayCFA: result.address
    }
}

const deployers = {
  token: deployToken,
};

export const { deploy } = makeDeployTask({
  deployers,
  rootDir: path.resolve(__dirname + "/../"),
});
