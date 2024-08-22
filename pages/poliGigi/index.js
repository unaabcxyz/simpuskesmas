import { useAuth } from "@/lib/hooks/auth";
import { useRouter } from "next/navigation";
import Master from "../Auth/Master";
import styles from '../../styles/Main.module.css';
import React, { useEffect, useState, useRef } from "react";
import useDeviceSize from "@/components/UseDevice/useDeviceSize";
import { useSelector, shallowEqual } from "react-redux";
import DataPoliGigi from "@/components/PoliGigi/DataPoliGigi";
import Header from "../Auth/Header";
import { useDispatch } from "react-redux";
import axiosClient from "../api/axios.client";
async function handleLogout() {
  const resp = await fetch('/api/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const data = await resp.json();
  if (data.success) {
    return;
  }
  throw new Error('Logout Gagal');
}
function useGlobalListPasienPoliGigi() {
  return useSelector((state) => state.listPasienPoliGigi, shallowEqual)
}
const mainPoliGigi = () => {
  const router = useRouter();
  const Swal = require('sweetalert2');
  const [admin, setAdmin] = useState({
    email: '',
    id: 0
  });
  const [width, height] = useDeviceSize();
  const listPasienPoliGigi = useGlobalListPasienPoliGigi();
  const [matches, setMatches] = useState(false)
  const [styleSideBarIcon, setStyleSideBarIcon] = useState({
    marginLeft: "1%",
  })
  const dispatch = useDispatch();
  useEffect(() => {
    if (width > 480) {
      setMatches(false)
      setStyleContainer({ ...styleContainer, ['width']: '900px', marginTop: '70px' })
    } else {
      setMatches(true);
      setStyleContainer({ ...styleContainer, ['width']: '250px', marginTop: '50px' })
    }
  }, [height])
  const toggleSideBar2 = useRef(true);
  const { loadingAuth, loggedIn, user } = useAuth();
  useEffect(() => {
    if (user !== null) {
      if (user.nama_poli != 'poli gigi' && user.nama_poli != 'admin') {
        if (user.nama_poli == 'poli gizi') {
          router.push('/poliGizi');
        } else if (user.nama_poli == 'poli umum') {
          router.push('/poliUmum');
        } else if (user.nama_poli == 'kia/kb') {
          router.push('/kiaKb');
        } else if (user.nama_poli == 'igd') {
          router.push('/main');
        }
      } else {
        setAdmin({ ...admin, ['id']: user.id, ['email']: user.email });
      }
    }
  }, [user])
  if (!loadingAuth && !loggedIn) {
    Swal.close();
    router.push('/');
  }
  const doLogout = () => {
    Swal.fire({
      title: '<p>Loading Logout</p>',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })
    handleLogout().then(() => {
      Swal.close();
      let timerInterval;
      Swal.fire({
        title: "Logout Berhasil!",
        html: "Anda akan diarahkan kehalaman login <b></b> milliseconds lagi.",
        timer: 2000,
        timerProgressBar: true,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector("b");
          timerInterval = setInterval(() => {
            timer.textContent = `${Swal.getTimerLeft()}`;
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        }
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
          router.push('/');
        }
      });
    })
  }
  const [styleContainer, setStyleContainer] = useState({
    marginLeft: "60px",
    width: '250px',
    marginTop: '20px'
  })
  const toggleSidebarFunc = () => {
    if (toggleSideBar2.current == false) {
      if (matches == false) {
        setStyleSideBarIcon({ ...styleSideBarIcon, ['marginLeft']: "1%" })
        setStyleContainer({ ...styleContainer, ['marginLeft']: '60px' });
      } else {
        setStyleSideBarIcon({ ...styleSideBarIcon, ['marginLeft']: "1%" })
        setStyleContainer({ ...styleContainer, ['marginLeft']: '10px' });
      }
      toggleSideBar2.current = true;

    } else {
      if (matches == false) {
        setStyleSideBarIcon({ ...styleSideBarIcon, ['marginLeft']: "13.8%" })
        setStyleContainer({ ...styleContainer, ['marginLeft']: '60px' });
      } else {
        setStyleSideBarIcon({ ...styleSideBarIcon, ['marginLeft']: "10.8%" })
        setStyleContainer({ ...styleContainer, ['marginLeft']: '10px' });
      } toggleSideBar2.current = false;
    }
  }
  const [cariIpt, setCariIpt] = useState("")
  const cariPasien = () => {
    Swal.showLoading();
    axiosClient.post('Poligigi/cariDataPoliGigi', { search: cariIpt }).then(({ data }) => {
      console.log(data);
      dispatch({ type: 'ISI_DATA_POLI_GIGI', dataPasien: data })
      Swal.close();
    })
    Swal.close();
  }
  return (
    admin.id > 0 ? (
      <div className="w-100">
        <div className="d-block bg-danger align-top " style={styleSideBarIcon} onClick={toggleSidebarFunc}>
          <div className={styles.cont_sidebar_icon + " d-flex align-items-center  rounded-circle  shadow "} style={{ cursor: "pointer" }}>
            <img src="http://simpuskesmasjungkat.online/iconFoto/menuSidebar2.png" className="w-50 h-50 mx-auto" />
          </div>
        </div>
        <div className="d-block">
          <Header toggleSideBar={toggleSideBar2.current} />
          <Master toggleSideBar={toggleSideBar2.current} matches={matches} />
          <div className="d-inline-block  align-top " style={styleContainer}>

            <h6>Kelola Data poli Gigi</h6>
            <div className={"input-group flex-nowrap " + matches == false ? ('w-25') : ('w-50')}>
              <input type="text" class="form-control" placeholder="Cari Pasien" value={cariIpt} onKeyDown={(e) => { e.key == 'Enter' ? (cariPasien()) : (null) }} onChange={(e) => { setCariIpt(e.target.value) }} aria-label="Username" aria-describedby="addon-wrapping" />
            </div>
            <DataPoliGigi listPasien={listPasienPoliGigi} />
          </div>
        </div>
      </div>
    ) : (null)
  )
}
export default mainPoliGigi;