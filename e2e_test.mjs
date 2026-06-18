// E2E test: register, login, create, read, update, delete character
// Run: node e2e_test.mjs
import fs from 'fs';

const base = process.env.BASE_URL || 'http://localhost:5000';

const rand = () => Math.floor(Math.random()*1e6);

async function run(){
  try{
    const email = `e2e${Date.now()}@example.com`;
    console.log('Registering', email);
    let res = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({name:'E2E User', email, password:'Password123'})
    });
    console.log('register', res.status);
    const regBody = await res.json();
    console.log(regBody);
    if(!regBody.token){
      throw new Error('Register failed');
    }
    const token = regBody.token;

    // Create character (multipart without file)
    const fd = new FormData();
    fd.append('name', 'Test Character '+rand());
    fd.append('house', 'Gryffindor');
    fd.append('wand', 'Holly');
    fd.append('patronus', 'Doe');
    fd.append('bloodStatus', 'Half-blood');
    fd.append('description', 'Created by e2e test');

    res = await fetch(`${base}/api/characters`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: fd
    });
    console.log('create character status', res.status);
    const created = await res.json();
    console.log('created:', created._id || created);
    if(!created._id) throw new Error('Create failed');
    const id = created._id;

    // Get characters
    res = await fetch(`${base}/api/characters`, {
      method: 'GET', headers: {'Authorization': `Bearer ${token}`} });
    console.log('get list', res.status);
    const list = await res.json();
    console.log('characters count', Array.isArray(list)?list.length:list);

    // Get by id
    res = await fetch(`${base}/api/characters/${id}`, { method: 'GET', headers: {'Authorization': `Bearer ${token}`} });
    console.log('get by id', res.status);
    const one = await res.json();
    console.log('one.name', one.name);

    // Update
    const fd2 = new FormData(); fd2.append('description','Updated by e2e');
    res = await fetch(`${base}/api/characters/${id}`, { method: 'PUT', headers: {'Authorization': `Bearer ${token}`}, body: fd2 });
    console.log('update status', res.status);
    const updated = await res.json();
    console.log('updated.description', updated.description);

    // Delete
    res = await fetch(`${base}/api/characters/${id}`, { method: 'DELETE', headers: {'Authorization': `Bearer ${token}`} });
    console.log('delete status', res.status);
    const del = await res.json();
    console.log('delete body', del);

    console.log('\nE2E test completed successfully');
  }catch(err){
    console.error('E2E failed:', err.message);
    process.exit(2);
  }
}

run();
