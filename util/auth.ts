// JWT
import jwt from "jsonwebtoken";

// Wallet
import { CONTROLLER_PRIVATE_KEY } from "./wallet";

// Universal Profile
import { UniversalProfile } from "./UniversalProfile";

export const getUniversalProfileFromAuthSession = async (
  token?: string
): Promise<UniversalProfile> => {
  if (!token) throw "Invalid authentication";

  try {
    const { address }: any = jwt.verify(token, CONTROLLER_PRIVATE_KEY);
    if (!address) throw "Invalid authentication";

    const universalProfile = new UniversalProfile(address);
    await universalProfile.init();

    return universalProfile;
  } catch (e) {
    throw "Invalid authentication";
  }
};
