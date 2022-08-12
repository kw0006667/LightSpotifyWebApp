import { GetServerSideProps, NextPage } from "next";
import React, { useState } from "react";
import CategoryBoxDOM from "../components/categorybox";
import SearchResultDOM from "../components/searchresult";
import { ISearchResult, Category} from "../types";
import axiosInstance from "../utilities/axios-instance";
import useSWR from "swr";
import { AxiosRequestConfig } from "axios";
import AuthInstance from "../utilities/auth-instance";

interface ISearchProps {
    access_token: string
}

interface ISearchState {
    categories: Category[] | undefined,
    searchResult: ISearchResult | undefined,
    isResult: boolean,
    isLoading: boolean
}

type CategoriesResult = {
    categories: Category[] | undefined
}

const fetcher = (config: AxiosRequestConfig<any>) => axiosInstance.request(config).then(response => response.data);

const useCategories = (access_token: string): CategoriesResult => {
    const requestConfig = {
        url: `https://api.spotify.com/v1/browse/categories?country=${AuthInstance.personalData?.country}&offset=0&limit=50`,
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        },
        method: 'GET'
    };

    const { data, error } = useSWR(requestConfig, fetcher);

    return {
        categories: data?.categories.items
    };
}

const SearchPage: NextPage<ISearchProps> = (props: ISearchProps) => {
    const { categories } = useCategories(props.access_token);
    const [searchResult, setSearchResult] = useState<ISearchResult | undefined>();

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

    if (!categories) {
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

    let categoryArray = categories.map(category => {
        return( <CategoryBoxDOM key={category.id} category={category} />);
    });

    return(
        <main>
            <div className='container maincontainer scrollarea'>
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
                                {categoryArray}
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