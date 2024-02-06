/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react"
import { Appbar } from "../components/Appbar"
import { Balance } from "../components/Balance"
import { Users } from "../components/Users"
import axios from "axios"


export const Dashboard = () => {

    const [userBalance, setUserBalance] = useState(0);
    const [firstName, setFirstName] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        axios.get("http://localhost:3000/api/v1/account/balance", {
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => {
            setUserBalance((res.data.balance)/100)
        })
        axios.get("http://localhost:3000/api/v1/user/me", {
            headers: {
                Authorization: "Bearer " + token
            }
        })
        .then(res => {
            setFirstName(res.data.firstName)
        })
    }, [])

    return <div>
        <Appbar firstName={firstName} />
        <div className="m-8">
            <Balance value={userBalance} />
            <Users />
        </div>
    </div>
}
