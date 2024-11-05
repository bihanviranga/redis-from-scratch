const KNOWN_ARGS = ["--dir", "--dbfilename"];

const config: { [key: string]: string } = {};

export function readCommandLineArguments() {
  if (!process.argv || process.argv.length <= 2) return;

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    if (KNOWN_ARGS.includes(arg)) {
      const argValueIndex = i + 1;
      if (argValueIndex < process.argv.length) {
        const argName = arg.slice(2);
        const argValue = process.argv[argValueIndex];
        config[argName] = argValue;
      }
    }
  }

  console.log("[config] Read config values:", config);
}

export function readConfig(key: string) {
  return config[key];
}
