import { ConfigFile } from "../../types";
import { decryptWallet, getGsnRelaySigner } from "./decrypt";
import sample from "../../test/fixtures/sample-config-ropsten.json";
import { getGSNRelayConfig } from "../../config";

const configFile = sample as ConfigFile;
const gsnConfig = getGSNRelayConfig("ropsten");

describe("decryptWallet", () => {
  it("should return wallet when decryption is successful", async () => {
    const wallet = await decryptWallet(configFile, "password", () => {});
    expect(wallet.address).toBe("0x1245e5B64D785b25057f7438F715f4aA5D965733");
    expect(wallet.privateKey).toBe(
      "0x416f14debf10172f04bef09f9b774480561ee3f05ee1a6f75df3c71ec0c60666"
    );
  });

  it("should throw when decryption fails", async () => {
    await expect(decryptWallet(configFile, "wrongPassword", () => {})).rejects.toThrow(
      /invalid password/
    );
  });
});

describe("getGsnRelayProvider", () => {
  it("should return gsn provider", async () => {
    const DEFAULT_PAYMASTER = "0x8057c0fb7089BB646f824fF4A4f5a18A8d978ecC";
    const wallet = await decryptWallet(configFile, "password", () => {});
    const gsnProvider = await getGsnRelaySigner(wallet, DEFAULT_PAYMASTER);
    expect(gsnProvider).toHaveProperty("_address", "0x1245e5B64D785b25057f7438F715f4aA5D965733");
    expect(gsnProvider).toHaveProperty("provider.provider.relayClient.config.chainId", 3);
    expect(gsnProvider).toHaveProperty(
      "provider.provider.relayClient.config.forwarderAddress",
      gsnConfig.forwarder
    );
    expect(gsnProvider).toHaveProperty(
      "provider.provider.relayClient.config.paymasterAddress",
      DEFAULT_PAYMASTER
    );
    expect(gsnProvider).toHaveProperty(
      "provider.provider.relayClient.config.relayHubAddress",
      gsnConfig.relayHub
    );
  }, 20000); // long timeout because getGsnRelaySigner takes awhile due to contract init
});
