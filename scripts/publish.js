const { execSync } = require('child_process');
const { version } = require('../package.json');
const tag = `v${version}`;

try {
  execSync(`git tag -a ${tag} -m ${tag} && git push origin ${tag}`, { stdio: 'pipe' });
  console.log(`Tag ${tag} pushed.`);
} catch { /* tag may already exist */ }

try {
  execSync(`gh release delete ${tag} --yes`, { stdio: 'pipe' });
} catch { /* no existing release to delete */ }
