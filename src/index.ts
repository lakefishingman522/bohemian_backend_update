#!/usr/bin/env node
import { program } from 'commander';
const Arweave = require('arweave');
import axios from 'axios';
import { PublicKey, Connection, clusterApiUrl, Cluster, Transaction } from '@solana/web3.js';
import {
    // loadData,
    getImageUrl,
    getMultipleAccounts,
    // saveMetaData,
    // MetaplexCacheJson,
    loadWalletKey,
    // MetadataCacheContent,
    sendSignedTransaction,
} from './utils';
import { Metadata, Data, Creator } from './metaplex/classes';
import { getMetadataAddress } from './metaplex/utils';
import { decodeMetadata, updateMetadataInstruction } from './metaplex/metadata';
import { MetadataContainer } from './data-types';
import { CANDY_MACHINE_ID } from './constants';

const RPC_CLUSTER_API = 'https://solana-api.projectserum.com';
// const RPC_CLUSTER_API = 'https://api.devnet.solana.com';
const RPC_CLUSTER = RPC_CLUSTER_API;

const arweaveKey = {
    kty: 'RSA',
    n: 'tHExchfI2CnBaGbaODKPNYH1xmdJYZVNsPNQyz4YfoYfy70tYsG_FUmX_7Xn8E8mwurOzuy4JhQr8V0JDJQp--Xfcwk7bKNATN8Mdkb0bcP-yUDWM1jLv1_YdQ3XNJlJnOqL8n2RZyBNIevO1jIzXZz4XCgoy5f-nUMPgHHbDMKEzXA9_XvPthrbi0uW2y0Z84N695wFhwNKlNeqoA9AJs26jAFU7v4Ep04krHUx3x2F_VkYcw6RYOlyMus_AK1m2VQjR1eWhs9ir7L_PPBXrhfo2ECyYKzpH9SjX_CCNhM5eYQnhaxonTwDxpr3EyCZ_CQwL7fX8braY-EyfCBcCLJZ5OgalNY_IMkovlClgLwqTlPBbP6WzKaH5KbWOtMK91ith5Fu-nAhubspLixMvfDMuL9IdXWdG7hRuF2-3LyRrHbgiL_BGXWvM4ufsSm7Yhk8ZtvXQdWnMwBHf4Kbo4_n5WPKBUF4wDf5tIfjDpykk6FniBtEsdXIcx9lcIAPXMgHKYdqem9aiaDFP53cCY8xUG8XA2D0WrEkrBpDFnE1sLH6xKEz7PEhHhKt3oOHjEPYbNjQMj1RA_saO0kKrdpCPo4pbZbgYiQ5amvH4PUYSLhSQDJcVyaVPy7xgETtlnlWMRSHytTL-Q-V36Uk--VRgXxz-XYQEsgi6V-GO2k',
    e: 'AQAB',
    d: 'fys3Wd2BYzcqY9X4_ZpEa8WH3ah1gxyigI865cKBqMoGJqTRE8TQUsRnJ4SgTjC6dKzfy93xeoTE43paIk9Zt3ounPhotQvpCUQ5mDIxmhqDunrDe7SdA-ccuoJipWNTChATSXdNvox5T-rM_xCqOtOiBfEXr0UT4OmeRzv20WtWBSORzNAxd3o-OFGxpA6JN6H2TAPdsWWUbooAaoXVBIQBcSKPJVBJH1BncFO4LjK0d_UO0if2NYLRRSmeYW_UCF7P7jvAjooiVwmj8OLCKKQZKi-Oh6vVMOW_rqHmYw3xd763y_HSWN4vGw2kDArx-03V2AuNWYQC3lmcJvb3ZMo96w9hFrD7VO5R3OioEkJfLjnWYIDBWoKUx7QHgE2PXrCZfWxl-xAXaAIl72J7IfY9Rh2mFT_-djJN_bVrpr2n0lG--GrwkSVSU5TGFEj19DrRPbjKEPuP2T_zPLXgWWcLA7ytojOUKUxQUFY73FcuFBSGmg4V7bQRsxLQcEsL7hqUc3jcPbyIfztSWE-4s55MQQHQGYtOtJgTOd1Joky4F9-OZW0M4--bofSBWxFB1LWZf_B0qUOCda0EGwkiCL92zaBMSsEM9MvYP1vLp_3P2fYjDwa91GPHBdTwFfWAIFd15hD1zdkgEiUmGbHjzSGTItHoU-U8vqtiW0HuHAE',
    p: '43tIssdTD8tQObC0b1AOA3UJ4KKA6UXV14c6xlIzhrs-BIotB0jijfmTrnpF0PyfbbOOQEY3Gm-jt4klWgv2_hw1VTe1XTdqchpfFLE52W9ZDI9ofkHEv0lwFOk7NzpyG55pe7gWiG7qwXTtAAmTUSQXub2ZRbUccwV_83Tu35dtl2xqKA-KdRic79p2YAW2WsS3Gw-b4Clxj_ljM4dWiJfra4phDKy49t_LoqbuIRh6lGGvIkriUwdreTIOSEIzKS_UaKC0hKduJHX-PUT8AC_qTv70IAD0K9cFTr35BiYjV5PmUuLMVZUE1Gq4nd7gbjPTkNY36cUSsoV4fR4hoQ',
    q: 'yxA9_-qOt3nsTvXK5xe1wDc_kQwb3W_Z8Xs1R3ToE5RclzO_mngrq4P_3R4EOO9jTH9HvqLlOF806V7jeTztt9DUQpM9-AxxgNL32nHRqazS-NNBqcjH4XxOuedXgoiMpNZtV6U3PCmTqLQFSGtZALr5JwihR2IRtJ4QNjqruyNZMbLm2bboTWfhoQ6BIeWl-M8gnzO_lr1jKVQn7mg24ibHj4WUDCVh47Av1D2RovHAepkB_I2jfwHS839awW_PWgMFvhO2q1qkRTeOCRI57Vk3eCx-JPP9RovkArWyLiPNAyx6pofvflyPD7xUaTa5_0jBBn3Gyy-7Prwy2bVUyQ',
    dp: 'nEXvVVH1T95eSKOJ8QZP-jQHCxjX8mkVVLEDwYZq-13aZwf9kwmRCfOwbqZ1G_LQG27EhIc4B6M2FznSPSAHF96NDPPuVhFhwO048GAn26XQyP4jzMilvrtWkib_lRtDlJGo6WM3p5Z7E1eeEO6DE7T1z5Xem7Klzqayla95AoVmtiW2b7rtZS_5cBTmSWTjN0v4dlCsxrvx1fR_H8ETw1aKViCEN07Y6lAn9p8y6-2DGDhbNfW3sU5hmKq4gQ9pUhwXkaEFIjRbSBT_CVxAumgwUQB4-Rtuokde0A9V6dF9agaircI8mXZ8EOkX1uxrxYk5CEEBvEi0ZYunkFyIwQ',
    dq: 'fw-6u9fZVZVE-GN0gwWjBJONgwVAql7C0Qd3Xy8XyKidBz-qNM3dBYWjJIkTu0yPpd4-1lq3c36fbSeizsoBNXPGXaIktIGUxDc-P8HYn4M0v93wyHyKFd3ipRDNATDQUJSb9qu61Dpv2rBKXfZNytcz7-jGghQrYAlHu6carg6AUUjQioqY8VZ_KHga9Urtf7KbhwKqb3gyBDpUgilTrk71sCi1aqQ5jG9CflvINV1wQ0Zap9044NATX6ng8Ak2hew-O6G6O56MC4OnrKVq-clJnDi69gR2Bx6hndBznctpDQNX-7wzb64bFo2RhARqfgLYRWeObLWBRNAeQXvlgQ',
    qi: 'cqqlthxLmpU2yB6auJG_sxFZf-3ZRFrDGViEeA2pPG7bK64HY0cSv8tPIW11AKQ4-5Ae5R4oMqadGPz9voZeXURr_8T0VvLajHIf3BxyG_qMkhKtOZUnAkP72BM6-wiFnYbK-GfnmrubOEIIkg1anG11Aw0ZUudAKtiKxi4CuN_Ifhj19yDSqjrOmu9CHJ-33N4WdzSlJEKvRMrFl4IKDkoyjTRsfORQ71BXNiPcgfkxhpkvoITiHdjwFSNtX1Vm3OhKL57Pa0LBa8kHJmsO4hIB9z56krEx3g3NEOJ11ylEC-FKL3ZzsYaisDqJiGvSZsJhgoE1Dez2BAJh51MemQ',
};
// const address = 'N-PkvsMH_U-Ri52wS1leAQF8RWEjFDqaZgSnvem--Sc';
const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
});

const getConnection = (env: string) => {
    const cluster = env === 'mainnet-beta' ? RPC_CLUSTER : clusterApiUrl(env as Cluster);
    const connection = new Connection(cluster);
    return connection;
};

// program.version('0.0.1');

// program
//     .command('download-metadata')
//     .option('-e, --env <string>', 'Solana cluster env name. One of: mainnet-beta, testnet, devnet', 'devnet')
//     .action(async (_directory, cmd) => {
//         // const { env } = cmd.opts();
//         //we have to change this to 'mainnet-beta'
//         const env = 'devnet';
//         // const data = loadData() as string[];
//         // if (!data) {
//         //     throw new Error('You need provide both token list and updated metadata json files');
//         // }

//         //we have to get this data externally - address of NFT
//         const data = ['4yokcECXFzw2uKLZjMxLUh7UAZJppur7D3FNxUAg1Jkp'];

//         const connection = getConnection(env);

//         const intermediateResult: { [key: string]: string } = {};
//         for (let index = 0; index < data.length; index++) {
//             const key = data[index];
//             const metaKey = await getMetadataAddress(new PublicKey(key));
//             intermediateResult[metaKey.toBase58()] = key;
//         }
//         const rawMetas = await getMultipleAccounts(connection, Object.keys(intermediateResult), 'finalized');

//         const result: MetadataContainer = {};

//         console.log('Decode the token metadata, this WILL take a while');
//         for (let index = 0; index < rawMetas.keys.length; index++) {
//             const metaKey = rawMetas.keys[index];
//             const metaAccount = rawMetas.array[index];
//             if (!metaAccount) {
//                 continue;
//             }

//             let mintMetaData: Metadata | undefined = undefined;
//             try {
//                 mintMetaData = decodeMetadata(metaAccount.data);
//             } catch {
//                 // do nothing
//             }
//             console.log(`Decoded #${index}: ${mintMetaData.data.name}`);
//             const mintKey = intermediateResult[metaKey];
//             console.log('mintMetaData', mintMetaData);

//             // only get NFTs from collection
//             if (mintMetaData?.data.creators && mintMetaData?.data.creators[0].address === CANDY_MACHINE_ID.toBase58()) {
//                 result[mintKey] = {
//                     metaKey,
//                     mintMetaData,
//                     name: mintMetaData?.data.name,
//                     uri: mintMetaData?.data.uri,
//                     imageUri: mintMetaData && (await getImageUrl(mintMetaData)),
//                 };
//             }
//         }

//         console.log(JSON.stringify(result, null, 2));
//         // at this point we have the metadata loaded from the chain
//         // saveMetaData(JSON.stringify(result, null, 2));

//         // console.log('result >>> ', result);
//     });

type TokenDetailsCurrent = {
    mint: string;
    index: number;
    metadata: any;
};

// const defaultCacheFilePath = 'data/current-metadata-cache.json';
// const defaultArweaveLinksPath = 'data/mainnet-beta-temp.json';
program
    .command('update')
    // .option('-e, --env <string>', 'Solana cluster env name. One of: mainnet-beta, testnet, devnet', 'devnet')
    // .option('-c, --cache-name <string>', 'Cache file name', `./${defaultCacheFilePath}`)
    // .option('-ar, --arweave-links <string>', 'Updated arweaeve links file name', `./${defaultArweaveLinksPath}`)
    // .option('-k, --keypair <path>', 'Solana wallet location', '--keypair not provided')
    .action(async (_directory) => {
        
        // .action(async (_directory, cmd) => {
        // const { cacheName, arweaveLinks, keypair } = cmd.opts();
        // const { keypair } = cmd.opts();

        /*╔═════════════════════════════╗
          ║         decode data         ║
          ╚═════════════════════════════╝*/
        const env = 'devnet';
        const connection = getConnection(env);

        const tokenAddress = ['4zYp9NL7vAWbf8YRCkhty3FerWrQR1sdcwTBBhnWjh9D'];

        const intermediateResult: { [key: string]: string } = {};
        for (let index = 0; index < tokenAddress.length; index++) {
            const key = tokenAddress[index];
            const metaKey = await getMetadataAddress(new PublicKey(key));
            intermediateResult[metaKey.toBase58()] = key;
        }
        const rawMetas = await getMultipleAccounts(connection, Object.keys(intermediateResult), 'finalized');

        const result: MetadataContainer = {};

        for (let index = 0; index < rawMetas.keys.length; index++) {
            const metaKey = rawMetas.keys[index];
            const metaAccount = rawMetas.array[index];
            if (!metaAccount) {
                continue;
            }

            let mintMetaData: Metadata | undefined = undefined;
            try {
                mintMetaData = decodeMetadata(metaAccount.data);
            } catch {
                // do nothing
            }
            console.log(`Decoded #${index}: ${mintMetaData.data.name}`);
            const mintKey = intermediateResult[metaKey];
            // console.log('mintMetaData', mintMetaData);

            // only get NFTs from collection
            if (mintMetaData?.data.creators && mintMetaData?.data.creators[0].address === CANDY_MACHINE_ID.toBase58()) {
                result[mintKey] = {
                    metaKey,
                    mintMetaData,
                    name: mintMetaData?.data.name,
                    uri: mintMetaData?.data.uri,
                    imageUri: mintMetaData && (await getImageUrl(mintMetaData)),
                };
            }
        }
        // console.log("result", result)

        // let decodedData = JSON.stringify(result, null, 2);

        /**********************************/
        /*╔═════════════════════════════╗
          ║             END             ║
          ║         decode data         ║
          ╚═════════════════════════════╝*/
        /**********************************/

        /*╔═════════════════════════════╗
          ║         upload json         ║
          ╚═════════════════════════════╝*/
        let uriPath = Object.values(result)[0] && Object.values(result)[0].uri;
        // console.log("oldUri :", uriPath);
        let metadataJson: any;
        await axios.get(uriPath).then((res) => {
            metadataJson = res.data;
        });

        //check if the NFT is already updated
        if (metadataJson.attributes.length == 7) {
            metadataJson.attributes && metadataJson.attributes.push({ trait_type: 'role', value: 'Guru Master' });
        } else if (metadataJson.attributes.length == 8) {
            metadataJson.attributes && metadataJson.attributes.pop({ trait_type: 'role', value: 'Guru Master' });
        }
        // metadataJson.attributes && metadataJson.attributes.pop();
        // console.log('metadataJson :', metadataJson);

        let transaction = await arweave.createTransaction({ data: JSON.stringify(metadataJson) }, arweaveKey);
        transaction.addTag('Content-Type', 'application/json');

        await arweave.transactions.sign(transaction, arweaveKey);
        // console.log('transaction ID: ', transaction.id);
        const newUri = `https://arweave.net/${transaction.id}`;

        // console.log("newUri :", newUri);
        let uploader = await arweave.transactions.getUploader(transaction);
        while (!uploader.isComplete) {
            await uploader.uploadChunk();
            console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
        }

        // console.log('newJson :', newUri);
        /**********************************/
        /*╔═════════════════════════════╗
          ║             END             ║
          ║         upload json         ║
          ╚═════════════════════════════╝*/
        /**********************************/
        const walletKeyPair = loadWalletKey();
        // const walletKeyPair = loadWalletKey(keypair);
        // const metadataPath = cacheName ?? `../${defaultCacheFilePath}`;
        // console.log(`Running on '${env}' network`);

        // const metadataCacheJson = loadData(metadataPath) as MetadataCacheContent;
        // const metadataCurrent: TokenDetailsCurrent[] = Object.entries(metadataCacheJson).map(
        //     ([mint, metadata]: [string, any]) => {
        //         const numberInTheName = metadata.mintMetaData.data.name.match(/\d+/)[0];
        //         const index = parseInt(numberInTheName);
        //         return {
        //             mint,
        //             index,
        //             metadata,
        //         };
        //     },
        // );

        const metadataCurrent: TokenDetailsCurrent[] = Object.entries(result).map(([mint, metadata]: [string, any]) => {
            const numberInTheName = metadata.mintMetaData.data.name.match(/\d+/)[0];
            const index = parseInt(numberInTheName);
            return {
                mint,
                index,
                metadata,
            };
        });
        // console.log('metadataCurrent', metadataCurrent[0]);

        // const arweaveLinksPath = arweaveLinks ?? `../${defaultArweaveLinksPath}`;
        // const arweaveJson = loadData(arweaveLinksPath) as MetaplexCacheJson;

        // const arweaveData = Object.entries(arweaveJson?.items).map(([key, value]) => {
        //     return {
        //         ...value,
        //         index: parseInt(key),
        //     };
        // });
        // // console.log('arweaveData', arweaveData);

        // if (!metadataCurrent || !arweaveData?.length) {
        //     throw new Error('You need provide both token list and updated metadata json files');
        // }

        // // console.log('metadataCurrent', metadataCurrent);

        // const metadataUpdated = metadataCurrent.reduce((acc, el) => {
        //     const arweaveLinks = arweaveData.find((a) => a.index === el.index);
        //     // console.log('arweaveLinks', arweaveLinks);

        //     if (!arweaveLinks) {
        //         console.log(`Can't find arweave link for ${el.index}. Skipping.`);
        //         return acc;
        //     }

        //     const uri = arweaveLinks.link;

        //     const elUpdated = {
        //         ...el,
        //         metadata: {
        //             ...el.metadata,
        //             mintMetaData: {
        //                 ...el.metadata.mintMetaData,
        //                 uri,
        //             },
        //             uri,
        //         },
        //     };

        //     return [...acc, elUpdated];
        // }, []);

        const updatedMetadata = {
            ...metadataCurrent[0],
            metadata: {
                ...metadataCurrent[0].metadata,
                mintMetaData: {
                    ...metadataCurrent[0].metadata.mintMetaData,
                    uri: newUri,
                },
                uri: newUri,
            },
        };

        // console.log('Number of items to be updated: ', metadataUpdated.length);

        // const nftItemToFix = 'TOKEN_ADDRESS_TO_UPDATE_AS_SINGLE_ITEM';
        // const metadataUpdatedFiltered = metadataUpdated.filter((el) => el.mint === nftItemToFix);

        // const metadataUpdatedFiltered = metadataUpdated.slice(0, 10000);

        // console.log('metadataUpdatedFiltered', metadataUpdatedFiltered);
        // return;

        // console.log('result >>> ', metadataUpdated);

        // failed to update tokens will be stored here and output at the end
        const failed = [];

        // next wee need to update using updateMetadataInstruction
        // for (const [index, el] of metadataUpdatedFiltered.entries()) {
        const updatedUri = updatedMetadata.metadata.uri;
        const { data, primarySaleHappened, updateAuthority } = updatedMetadata.metadata.mintMetaData;
        const mintKey = updatedMetadata.metadata.mintMetaData.mint;
        const newUpdateAuthority = updateAuthority;

        const creators = data.creators.map(
            (el) =>
                new Creator({
                    ...el,
                }),
        );

        const updatedData = new Data({
            name: data.name,
            symbol: data?.symbol,
            uri: updatedUri,
            creators: [...creators],
            sellerFeeBasisPoints: data.sellerFeeBasisPoints,
        });

        // console.log('updatedData', updatedData);

        // console.log(`Updating token #${index} ${mintKey}...`);

        try {
            const instruction = await updateMetadataInstruction(
                updatedData,
                newUpdateAuthority,
                primarySaleHappened,
                mintKey,
                updateAuthority,
                // metadataAccountStr,
            );

            // console.log('instruction', instruction);
            const tx = new Transaction().add(instruction);

            tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
            tx.feePayer = walletKeyPair.publicKey;

            tx.sign(walletKeyPair, walletKeyPair);
            // console.log('tx', tx);

            const { txid, slot } = await sendSignedTransaction({
                connection,
                signedTransaction: tx,
            });

            console.log('✅ Tx was successful! ID: ', txid, slot);
        } catch (error) {
            failed.push(mintKey);
            // console.warn(`🚫 Items: ${el.index} failed to update with error:`, error.message);
        }
        // }

        // console.log(`${metadataUpdatedFiltered.length} items have been updated!`);

        if (failed.length) {
            console.log('🚫 List of failed to update tokens: ', failed);
            console.log('Try rerun script on this tokens only.');
        } else {
            console.log('🚫 No failed transactions. Life is good! 😎');
        }
    });

program.parse(process.argv);
