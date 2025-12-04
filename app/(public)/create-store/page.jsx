'use client'
import { assets } from "@/assets/assets"
import { useEffect, useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Loading from "@/components/Loading"
import { useRouter } from "next/navigation"
import { useUser, useAuth } from "@clerk/nextjs"
import  prisma  from "@/lib/prisma"
import axios from "axios"
import imagekit from '@/configs/imageKit'

export default function CreateStore() {

    //Get the user and router
    const router = useRouter();
    const{user}=useUser();
    //let's get the token
    const {getToken}=useAuth();
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState("")

    const [storeInfo, setStoreInfo] = useState({
        name: "",
        username: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        image: ""
    })

    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    const fetchSellerStatus = async () => {
        //Let's get the seller
        const token = await getToken()
        try{
          const {data} = await axios.get('/api/store/create',{
            headers:{Authorization:`Bearer ${token}`}
          })
          //Let's check the status and switch position accordingly
          if(["pending","approved","rejected"].includes(data.status)){
            setAlreadySubmitted(true)
            setStatus(data.status)
            switch(data.status){
                case "approved":
                    setMessage("Your store has been approved! Redirecting to dashboard...")
                    setTimeout(() => {
                        router.push('/store')
                    }, 5000)
                    break;
                case "pending":
                    setMessage("Your store application is under review. We will notify you once it's approved.")
                    break;
                case "rejected":
                    setMessage("Unfortunately, your store application was rejected. You may contact support for more information.")
                    break;
            }
        }else{
            setAlreadySubmitted(false)
        }
    } catch(error) {
        toast.error(error?.response?.data?.error || error.message);
        }



        setLoading(false)
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        //if the user is not logged in, return error
        if(!user){
            toast.error('you must be logged in to perform this action')
        }
        try{
         const token = await getToken();
         //let's get a form data
         const formData = new FormData();
         formData.append('name', storeInfo.name);
         formData.append('username', storeInfo.username);
         formData.append('description', storeInfo.description);
         formData.append('email', storeInfo.email);
         formData.append('contacts', storeInfo.contact);
         formData.append('address', storeInfo.address);
         formData.append('image', storeInfo.image);

         //make the api call to create the store
         //using the axios library
         const {data}= await axios.post('/api/store/create', formData, {
            headers:{Authorization:`Bearer ${token}`}})
            toast.success(data.message);
            //let's call the fetch function 
            await fetchSellerStatus();
        
        }catch(error){
            toast.error(error?.response?.data?.error || error.message);
        }

        


    }

    useEffect(() => {
        if(user){
             fetchSellerStatus()
        }
    }, [user])
    //user the user is not logged in, show a message to login
    if(!user){
        return(
            <div className="min-h-[80vh] flex flex-col items-center justify-center">
                <h1 className="sm:text-2xl lg:text-3xl mx-5 font-semibold text-slate-500 text-center max-w-2xl">You must be  <span className="text-slate-500">loggedIn</span> to create a store.</h1>
            </div>
        )
    }

    return !loading ? (
        <>
            {!alreadySubmitted ? (
                <div className="mx-6 min-h-[70vh] my-16">
                    <form onSubmit={e => toast.promise(onSubmitHandler(e), { loading: "Submitting data..." })} className="max-w-7xl mx-auto flex flex-col items-start gap-3 text-slate-500">
                        {/* Title */}
                        <div>
                            <h1 className="text-3xl ">Add Your <span className="text-slate-800 font-medium">Store</span></h1>
                            <p className="max-w-lg">To become a seller on JeesCage, submit your store details for review. Your store will be activated after admin verification.</p>
                        </div>

                        <label className="mt-10 cursor-pointer">
                            Store Logo
                            <Image src={storeInfo.image ? URL.createObjectURL(storeInfo.image) : assets.upload_area} className="rounded-lg mt-2 h-16 w-auto" alt="" width={150} height={100} />
                            <input type="file" accept="image/*" onChange={(e) => setStoreInfo({ ...storeInfo, image: e.target.files[0] })} hidden />
                        </label>

                        <p>Username</p>
                        <input name="username" onChange={onChangeHandler} value={storeInfo.username} type="text" placeholder="Enter your store username" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Name</p>
                        <input name="name" onChange={onChangeHandler} value={storeInfo.name} type="text" placeholder="Enter your store name" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Description</p>
                        <textarea name="description" onChange={onChangeHandler} value={storeInfo.description} rows={5} placeholder="Enter your store description" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none" />

                        <p>Email</p>
                        <input name="email" onChange={onChangeHandler} value={storeInfo.email} type="email" placeholder="Enter your store email" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Contact Number</p>
                        <input name="contact" onChange={onChangeHandler} value={storeInfo.contact} type="text" placeholder="Enter your store contact number" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded" />

                        <p>Address</p>
                        <textarea name="address" onChange={onChangeHandler} value={storeInfo.address} rows={5} placeholder="Enter your store address" className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none" />

                        <button className="bg-slate-800 text-white px-12 py-2 rounded mt-10 mb-40 active:scale-95 hover:bg-slate-900 transition ">Submit</button>
                    </form>
                </div>
            ) : (
                <div className="min-h-[80vh] flex flex-col items-center justify-center">
                    <p className="sm:text-2xl lg:text-3xl mx-5 font-semibold text-slate-500 text-center max-w-2xl">{message}</p>
                    {status === "approved" && <p className="mt-5 text-slate-400">redirecting to dashboard in <span className="font-semibold">5 seconds</span></p>}
                </div>
            )}
        </>
    ) : (<Loading />)
}