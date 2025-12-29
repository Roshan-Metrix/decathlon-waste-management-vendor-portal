import React, {useContext, useState, useEffect} from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContent } from '../context/AppContext';
import { useParams } from 'react-router-dom';

const Transactions = ({route}) => {
    const [transactionItems, setTransactionItems] = useState([]);
    const transactionId  = useParams().id;
    const { backendUrl } = useContext(AppContent);

  const getTransactionData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/auth/vendor/particular-transactions/${transactionId}`
      );
      if (data.success) {
        setTransactionItems(data);
        console.log(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  useEffect(() => {
    getTransactionData();
  }, [transactionId, backendUrl]);

  return (
    <div></div>
  )
}

export default Transactions