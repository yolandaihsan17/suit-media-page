import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import axios from 'axios';
import moment from 'moment'
import Paginator from '../components/paginator';
import SuiteMediaLogo from '../public/suitemedia.png'

// import { useAppContext } from "../context/AppContext";

interface Meta {
  current_page: number,
  from: number,
  last_page: number,
  links: any[],
  path: string,
  per_page: number,
  to: number,
  total: number
}

const Home: NextPage = () => {

  const defaultValue: any = {
    current_page: 1,
    from: 1,
    last_page: 1,
    links: [],
    path: '',
    per_page: 10,
    to: 1,
    total: 1,
    sort: 'newest',
    content: []
  }

  let storageMeta: any = JSON.stringify(defaultValue)
  let parsedStorage = JSON.parse(storageMeta)

  const [meta, setMeta] = useState<Meta>({
    current_page: 1,
    from: 1,
    last_page: 1,
    links: [],
    path: '',
    per_page: 10,
    to: 1,
    total: 1,
  })

  const [currentMenu, setCurrentMenu] = useState('ideas')
  const pagesList = ['work', 'about', 'services', 'ideas', 'careers', 'contact']

  const [content, setContent] = useState<any[]>([])
  const [sort, setSort] = useState('newest')
  // const [limit, setLimit] = useState<number>(10)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const defaultImage = 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'

  useEffect(() => {
    // console.log('here', state)
    initStorage().then((res: any) => {
      getContent(res.current_page, res.per_page, res.sort)
    })

    // remove navbar when scroll down
    if (typeof window !== 'undefined') {
      const navbarEl = document.getElementById("navbar")
      let prevScrollpos = window.pageYOffset;
      document.addEventListener('scroll', () => {
        let currentScrollPos = window.pageYOffset;
        if (navbarEl) {
          if (prevScrollpos > currentScrollPos) {
            navbarEl.style.top = "0px";
            navbarEl.style.opacity = '100'
          } else {
            navbarEl.style.top = "-80px";
            navbarEl.style.opacity = '0'
          }
          prevScrollpos = currentScrollPos;
        }

      })
    }
  }, [])


  const initStorage = () => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined') {
        storageMeta = localStorage.getItem('meta') ? localStorage.getItem('meta') : JSON.stringify(defaultValue)
        setMeta({
          current_page: storageMeta.current_page,
          from: storageMeta.from,
          last_page: storageMeta.last_page,
          links: storageMeta.links,
          path: storageMeta.path,
          per_page: storageMeta.per_page,
          to: storageMeta.to,
          total: storageMeta.total
        })
        setSort(storageMeta.sort)
        resolve(JSON.parse(storageMeta))
      } else reject()
    })
  }

  // fetching API
  const getContent = (currentPage: number, limit: number, sort: string) => {
    setIsLoading(true)
    const sortMode = sort === 'newest' ? '-published_at' : 'published_at'
    axios.get(`https://suitmedia-backend.suitdev.com/api/ideas?page[number]=${currentPage}&page[size]=${limit}&append[]=small_image&append[]=medium_image&sort=${sortMode}`).then(res => {

      if (res.data.data.length === 0 && res.data.meta.last_page < meta.current_page) {
        getContent(res.data.meta.last_page, res.data.meta.per_page, sort)
      } else {
        setMeta(res.data.meta)
        setContent(res.data.data)
      }

      const locStorageData = { ...res.data.meta, sort: sort, content: res.data.data }
      localStorage.setItem('meta', JSON.stringify(locStorageData))

    }).finally(() => setIsLoading(false))
  }

  // Handle Limit change
  const changeLimit = (limit: number) => {
    getContent(meta.current_page, limit, sort)
  }

  // Handle page change
  const changePage = (page: number) => {
    const temp: Meta = { ...meta, current_page: page }
    getContent(page, meta.per_page, sort)
    setMeta(prev => ({ ...prev, current_page: page }))
  }

  // Handle Sorting
  const sortList = (mode: string) => {
    setSort(mode)
    getContent(meta.current_page, meta.per_page, mode)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Head>
        <title>Suite Media App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isLoading &&
        <div className='fixed top-0 left-0 z-20 bg-black/50 backdrop-blur-sm w-full min-h-screen flex items-center justify-center'>
          <div className='text-white text-xl animate-pulse'>Loading...</div>
        </div>
      }

      <main className="flex w-full flex-1 flex-col items-stretch justify-start pb-20">

        <div id='navbar' className='fixed w-full top-0 left-0 z-20 flex flex-row items-center justify-around gap-2 p-2 py-4 bg-primary shadow-md transition-all duration-300 ease-in-out'>
          {/* <Image src={SuiteMediaLogo} alt='suitemedia logo' width={200} height={60} className=''></Image> */}
          <div className='text-lg font-bold text-white'>Suit Media</div>
          <div className='flex flex-row items-start justify-end gap-4 text-white'>
            {pagesList.map((item, index) => (
              <div key={index} onClick={(() => setCurrentMenu(item))} className={`${item === currentMenu ? 'border-b-2' : ' border-none'} p-2 border-white capitalize cursor-pointer`}>{item}</div>
            ))}
          </div>
        </div>

        <div className='flex flex-col items-center justify-center gap-2 min-h-[500px] text-white relative overflow-hidden bg-fixed bg-center bg-cover'
          style={{ backgroundImage: `url(${defaultImage})`, clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0% 100%)' }}>
          <div className='text-6xl z-10'>Ideas</div>
          <div className='text-lg z-10 font-thin'>Where all our great things begin</div>
          <div className='absolute bg-black/40 top-0 left-0 min-h-screen w-full'></div>
        </div>

        {/* LIST SECTION */}
        <div className='flex flex-col items-stretch justify-start gap-4 p-12'>

          {/* TOOLS */}
          <div className='flex flex-row items-center justify-between'>
            {/* LEFT SIDE */}
            <div>Showing 1-10 of 100</div>

            {/* RIGHT SIDE */}
            <div className='flex flex-row items-center justify-end gap-8'>
              {/* LIMIT PAGE */}
              <div className='flex flex-row items-center justify-end gap-2'>
                <div>Show per page:</div>
                <select
                  className='rounded-full py-2 px-8 border border-gray-300'
                  value={meta.per_page}
                  onChange={(e) => changeLimit(+e.target.value)}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* SORTING */}
              <div className='flex flex-row items-center justify-end gap-2'>
                <div>Sort by:</div>
                <select
                  className='rounded-full py-2 px-8 border border-gray-300'
                  value={sort}
                  onChange={(e) => sortList(e.target.value)}
                >
                  <option value={'newest'}>Newest</option>
                  <option value={'oldest'}>Oldest</option>
                </select>
              </div>

            </div>
          </div>

          {/* CARD LIST */}
          <div className='flex flex-row items-stretch justify-center gap-4 flex-wrap mt-4'>

            {/* CARD */}
            {content.length > 0 && content.map((item, index) => (
              <div className='p-2 cursor-pointer' key={index}>
                <div className=' h-full flex flex-col items-stretch justify-start gap-2 overflow-hidden rounded-xl shadow-md w-80'>

                  <Image
                    unoptimized
                    width={200}
                    height={200}
                    className='w-auto h-[200px] object-cover'
                    loader={() => item.small_image.length > 0 ? item.small_image[0].url : defaultImage}
                    alt="card item"
                    src={item.small_image.length > 0 ? item.small_image[0].url : defaultImage}
                    loading='lazy'
                  >
                  </Image>

                  <div className='text-gray-500 text-sm font-bold px-4'>{moment(item.published_at).format('D MMMM YYYY')}</div>
                  <div className='font-bold px-4 pb-4 text-sm -mt-2'>{item.title}</div>
                </div>
              </div>
            ))}
            {/* END OF CARD */}

          </div>
        </div>

        {content.length > 0 &&
          <Paginator
            totalItems={meta.total}
            currentPage={meta.current_page}
            limit={meta.per_page}
            pageChanged={(page: number) => changePage(page)}
            totalPages={meta.last_page}
          />
        }
      </main>
    </div>
  )
}

export default Home
