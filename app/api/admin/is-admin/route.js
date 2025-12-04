import {getAuth} from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'


//Auth Administrator
export async function GET(request) {
    try {
        //let's get the user 
        const {userId}=getAuth(request)
        const isAdmin= await authAdmin(userId)

        if(!isAdmin){
           return NextResponse.json({error:'Unauthorized Access'}, {status:403}) 
        }
        return NextResponse.json({message:'You are an admin'}, {status:200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error:'Internal Server Error'}, {status:500})
    }
}

