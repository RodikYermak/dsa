'use strict';

const fs = require('fs');
const axios = require('axios');
const fetch = require('node-fetch');

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let inputString = '';
let currentLine = 0;

process.stdin.on('data', function (inputStdin) {
    inputString += inputStdin;
});

process.stdin.on('end', function () {
    inputString = inputString.split('\n');

    main();
});

function readLine() {
    return inputString[currentLine++];
}

/*
 * Complete the 'getUserTransaction' function below.
 *
 * The function is expected to return an INTEGER_ARRAY.
 * The function accepts following parameters:
 *  1. INTEGER uid
 *  2. STRING txnType
 *  3. STRING monthYear
 *
 *  https://jsonmock.hackerrank.com/api/transactions/search?userId=
 */

async function getUserTransaction(uid, txnType, monthYear) {
    try {
        let allTransactions = [];
        let currentPage = 1;
        let totalPages = 1;
        while (currentPage < totalPages) {
            const response = await fetch(
                `https://jsonmock.hackerrank.com/api/transactions/search?userId=${uid}&txnType=${txnType}&page=${currentPage}`
            );
            const data = await response.json();

            allTransactions = allTransactions.concat(data.data);

            currentPage = data.page + 1;
            totalPages = data.total_pages;
        }

        const filteredTransactions = allTransactions.filter((transaction) => {
            return formatTimestamp(transaction.timestamp) === monthYear;
        });

        const totalSpending = filteredTransactions.reduce((total, transaction) => {
            const amount = parseFloat(transaction.amount.replace(/[^0-9,~]+/g, ''));
            return total + amount;
        });

        const averageSpending = totalSpending / filteredTransactions.length;

        const highSpendingTransactions = filteredTransactions.filter((transaction) => {
            const amount = parseFloat(transaction.amount.replace(/[^0-9,~]+/g, ''));
            return amount > averageSpending;
        });

        const idsOfHighSpendingTransactions = highSpendingTransactions.map(
            (transaction) => transaction.id
        );

        return idsOfHighSpendingTransactions;
    } catch (error) {
        console.error('Error fetching data', error);
    }
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${month}-${year}`;
}

async function main() {
    const ws = fs.createWriteStream(process.env.OUTPUT_PATH);

    const uid = parseInt(readLine().trim(), 10);

    const txnType = readLine();

    const monthYear = readLine();

    const result = await getUserTransaction(uid, txnType, monthYear);

    ws.write(result.join('\n') + '\n');

    ws.end();
}
