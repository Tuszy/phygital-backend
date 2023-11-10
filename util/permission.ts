// To reduce the execution time of the serverless edge function we define the permission data as a constant magic value
// You can find the calculation details in https://github.com/Tuszy/phygital-frontend/blob/main/util/permission.ts

export default {
  keys: [
    "0x4b80742de2bf82acb3630000ac11803507c05a21daaf9d354f7100b1dc9cd590",
    "0x4b80742de2bf393a64c70000ac11803507c05a21daaf9d354f7100b1dc9cd590",
  ],
  values: [
    "0x0000000000000000000000000000000000000000000000000000000000000800",
    "0x002000000002ffffffffffffffffffffffffffffffffffffffff5f5b600b1e3e3915002000000002ffffffffffffffffffffffffffffffffffffffff5f5b600b65090a4b002000000002ffffffffffffffffffffffffffffffffffffffff5f5b600b511b6952",
  ],
};
