import { GetServerSideProps, NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useInView } from 'react-intersection-observer'
import {
    useQuery,
    useMutation,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
    useInfiniteQuery,
  } from '@tanstack/react-query'
import CategoryBoxDOM from "../components/categorybox";
import SearchResultDOM from "../components/searchresult";
import { ISearchResult, Category, FetchCategoriesInfo} from "../types";
import axiosInstance from "../utilities/axios-instance";
import useSWR from "swr";
import { AxiosRequestConfig } from "axios";
import AuthInstance from "../utilities/auth-instance";

interface ISearchProps {
    access_token: string
}

const useCategoriesInfinite = (access_token: string) => {
    const {
        status,
        data,
        error,
        isFetching,
        isFetchingNextPage,
        isFetchingPreviousPage,
        fetchNextPage,
        fetchPreviousPage,
        hasNextPage,
        hasPreviousPage,
      } = useInfiniteQuery(
        ['projects'],
        async ({ pageParam = `https://api.spotify.com/v1/browse/categories?country=${AuthInstance.personalData?.country}&offset=0&limit=50` }): Promise<FetchCategoriesInfo> => {
            const requestConfig = {
                url: pageParam,
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                    'Content-Type': 'application/json'
                },
                method: 'GET'
            };
            const res = await axiosInstance.request(requestConfig);
            return res.data;
        },
        {
          getPreviousPageParam: (firstPage) => firstPage.categories?.previous ?? undefined,
          getNextPageParam: (lastPage) => lastPage.categories?.next ?? undefined,
        },
    );

    return {
        status: status,
        data: data,
        isFetching: isFetching,
        fetchNextPage: fetchNextPage,
        hasNextPage: hasNextPage
    };
}

const SearchPage: NextPage<ISearchProps> = (props: ISearchProps) => {
    const { status, data, isFetching, fetchNextPage, hasNextPage } = useCategoriesInfinite(props.access_token);
    const [searchResult, setSearchResult] = useState<ISearchResult | undefined>();
    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView) {
            fetchNextPage();
        }
    }, [inView]);

    const searchInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            let searchText = event.target.value;
            let requestConfig = {
                url: `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchText)}&type=album,track,artist,playlist,show,episode&limit=10`,
                headers: {
                    'Authorization': 'Bearer ' + props.access_token,
                    'Content-Type': 'application/json'
                },
                method: 'GET'
            };

            axiosInstance.request(requestConfig)
            .then(response => {
                setSearchResult(response.data);
            });
        }
    }

    if (isFetching) {
        return(
            <main>
                <div className='container maincontainer scrollarea'>
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    let result = <></>;
    if (searchResult) {
        result = <SearchResultDOM searchResult={searchResult} />;
    }

    return(
        <main>
            <div className='container maincontainer scrollarea' ref={ref}>
                <div style={{marginTop: '10px'}}>
                    <section>
                        <div className="m-3">
                            <input type="text" list="datalistOptions" className="form-control" id="searchInput" placeholder="Search" onKeyUp={(e) =>{searchInput(e)}}></input>
                        </div>
                    </section>
                    <section>
                        {result}
                    </section>
                    <div id="resultContent">
                        <section className="artist-section">
                            <div className="artist-section-title">
                                Categories
                            </div>
                            <div className="d-flex flex-wrap">
                                {data?.pages.map(page => (
                                    <React.Fragment key={page.categories.href}>
                                        {page.categories.items.map(category => (
                                            <CategoryBoxDOM key={category.id} category={category} />
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );   
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req, res } = context;
    const token = req.cookies.access_token;
    if (!token) {
        return {
            redirect: {
                permanent: false,
                destination: '/'
            }
        };
    }

    return {
        props: {
            access_token: token
        }
    };
}

export default SearchPage;