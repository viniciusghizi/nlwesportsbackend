import express from 'express'
import { PrismaClient } from '@prisma/client'
import { convertHourStringToMinutes } from './utils/convert-hour-string-to-minutes'
import { convertMinutesToHourString } from './utils/convert-minutes-to-hour-string'

const app = express()
const prisma = new PrismaClient()


app.use(express.json())


app.get('/games',async (request,response)=>{
    const games = await prisma.game.findMany({
        include:{
            _count:{
                select:{
                    ads:true,
                }
            }
        }
    })
    
    return response.json(games);
})

app.post('/games/:id/ads', async (request,response) =>{
    const gameId = request.params.id
    const body = request.body;

    const ad = await prisma.ad.create({
        data:{
            gameId,
            name: body.name,
            yearPlaying: body.yearPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: convertHourStringToMinutes(body.hourStart),
            hourEnd: convertHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel,
        }
    })

    return response.status(201).json(ad);
})

app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;

    const ads = await prisma.ad.findMany({
        select:{
            id:true,
            name:true,
            weekDays:true,
            useVoiceChannel:true,
            yearPlaying:true,
            hourStart:true,
            hourEnd:true,
        },
        where:{
            gameId,
        },
        orderBy:{
            createAt: 'desc'
        }
    })
    return response.json(ads.map(ad =>{
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinutesToHourString(ad.hourStart),
            hourEnd: convertMinutesToHourString(ad.hourEnd),
        }
    }))
})

app.get('/ads/:id/discords', async (request, response) => {
    const adId = request.params.id;
    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord:true,
        },
        where: {
            id: adId,
        }
    })
    return response.json({
        discord: ad.discord,
    })
})

app.listen(3333)