import * as core from '@actions/core';
import {InstallSource} from "@docker/actions-toolkit/lib/docker/install";

export interface Inputs {
  source: InstallSource;
  daemonConfig?: string;
  context: string;
  setHost: boolean;
}

export function getInputs(): Inputs {
  const rawVersion = core.getInput('version') || 'latest';
  const source = parseSource(rawVersion);
  const channel = core.getInput('channel');
  if (channel && source.type === 'archive') {
    source.channel = channel;
  }

  return {
    source: source,
    daemonConfig: core.getInput('daemon-config'),
    context: core.getInput('context'),
    setHost: core.getBooleanInput('set-host')
  };
}

function parseSource(version: string): InstallSource {
  const values = new Map<string, string>();
  if (version.indexOf('=') !== -1) {
    const csv = version.split(',');
    for (const c of csv) {
      const kv = c.split('=');
      values.set(kv[0], kv[1]);
    }
  } else {
    values.set('type', 'archive');
    values.set('version', version);
  }

  let src: InstallSource;
  switch (values.get('type') || 'archive') {
    case 'archive':
      src = {
        type: 'archive',
        version: values.get('version') || 'latest',
        channel: values.get('channel') || 'stable'
      };
      break;
    case 'image':
      src = {
        type: 'image',
        tag: values.get('tag') || 'latest'
      };
      break;
  }

  if (!src) {
    throw new Error(`Invalid version: ${version}`);
  }

  return src;
}
