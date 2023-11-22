// To reduce the execution time of the serverless edge function we define the permission data as a constant magic value
// You can find the calculation details in https://github.com/Tuszy/phygital-frontend/blob/main/util/permission.ts

export default {
  keys: [
    "0x4b80742de2bf82acb3630000ac11803507c05a21daaf9d354f7100b1dc9cd590",
    "0x4b80742de2bf393a64c70000ac11803507c05a21daaf9d354f7100b1dc9cd590",
    "0x4b80742de2bf866c29110000ac11803507c05a21daaf9d354f7100b1dc9cd590",
  ],
  values: [
    "0x0000000000000000000000000000000000000000000000000000000000440800",
    "0x002000000002ffffffffffffffffffffffffffffffffffffffffae8205e131646613002000000002ffffffffffffffffffffffffffffffffffffffffae8205e141b3d513002000000002ffffffffffffffffffffffffffffffffffffffffae8205e1511b6952",
    "0x00107c8c3416d6cda87cd42c71ea1843df28000c74ac2555c10b9349e78f0000",
  ],
};
