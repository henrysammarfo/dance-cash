const testData = {
    name: "Afrobeats Night with DJ Spinall",
    date: "2025-01-15",
    attendee: "Henry Marfo",
    signupId: "898c8a34-0e2b-4dd2-85cd-736e3246f67a",
};

const commitment = Buffer.from(JSON.stringify(testData)).toString('hex');
console.log('Metadata:', testData);
console.log('JSON length:', JSON.stringify(testData).length);
console.log('Hex length:', commitment.length);
console.log('Bytes:', commitment.length / 2);
console.log('\nCashToken commitment limit is typically 40 bytes');
console.log('Current size:', commitment.length / 2, 'bytes');

if (commitment.length / 2 > 40) {
    console.log('\n❌ TOO LARGE! Need to reduce further.');
} else {
    console.log('\n✅ Size is OK!');
}

// Test minimal version
const minimal = {
    e: "Afrobeats Night",
    d: "2025-01-15",
    a: "Henry",
};

const minCommitment = Buffer.from(JSON.stringify(minimal)).toString('hex');
console.log('\n=== MINIMAL VERSION ===');
console.log('Metadata:', minimal);
console.log('Bytes:', minCommitment.length / 2);
