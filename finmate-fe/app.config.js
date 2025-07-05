require('dotenv').config();

export default {
  expo: {
    name: 'finmate',
    slug: 'finmate',
    version: '1.0.0',
    extra: {
      DEFAULT_TOKEN: process.env.DEFAULT_TOKEN,
    },
  },
};
