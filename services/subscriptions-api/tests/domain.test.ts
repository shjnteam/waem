import {test} from 'node:test';import {strict as assert} from 'node:assert';import {canTransition,calculateMRR} from '../src/domain.js';
test('trial can become active',()=>assert.equal(canTransition('trialing','active'),true));
test('canceled cannot reactivate',()=>assert.equal(canTransition('canceled','active'),false));
test('MRR excludes trials and normalizes yearly plans',()=>assert.equal(calculateMRR([{status:'active',interval:'monthly',price_minor:10000},{status:'active',interval:'yearly',price_minor:120000},{status:'trialing',interval:'monthly',price_minor:9999}]),20000));
