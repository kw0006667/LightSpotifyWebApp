import { GetServerSideProps } from "next";
import React from "react";
import CategoryBoxDOM from "../components/categorybox";
import SearchResultDOM from "../components/searchresult";
import { ISearchResult, Category} from "../types";
import axiosInstance from "../utilities/axios-instance";


interface ISearchProps {
    access_token: string
}

interface ISearchState {
    categories: Category[] | undefined,
    searchResult: ISearchResult | undefined,
    isResult: boolean,
    isLoading: boolean
}

class SearchPage extends React.Component<ISearchProps, ISearchState> {
    constructor(props: ISearchProps) {
        super(props);
        this.state = {
            categories: [],
            searchResult: undefined,
            isResult: false,
            isLoading: false,
        };
    }

    componentDidMount() {
        this.setState({
            isLoading: true
        });
        this.fetchCategories();
    }

    fetchCategories() {
        let requestConfig = {
            url: `https://api.spotify.com/v1/browse/categories?limit=50`,
            headers: {
                'Authorization': 'Bearer ' + this.props.access_token,
                'Content-Type': 'application/json'
            },
            method: 'GET'
        };

        axiosInstance.request(requestConfig)
        .then(response => {
            this.setState({
                categories: response.data.categories.items,
                isLoading: false
            });
        });
    }

    searchInput(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            let searchText = event.target.value;
            let requestConfig = {
                url: `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchText)}&type=album,track,artist,playlist,show,episode&limit=10`,
                headers: {
                    'Authorization': 'Bearer ' + this.props.access_token,
                    'Content-Type': 'application/json'
                },
                method: 'GET'
            };

            axiosInstance.request(requestConfig)
            .then(response => {
                this.setState({
                    searchResult: response.data,
                    isResult: true
                });
            });
        }
    }

    render() {
        if (this.state.isLoading) {
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
        if (!this.state.categories) {
            return <p>No enough data</p>
        }
    
        let result = <></>;
        if (this.state.isResult && this.state.searchResult) {
            result = <SearchResultDOM searchResult={this.state.searchResult} />;
        }
    
        let categoryArray = this.state.categories.map(category => {
            return( <CategoryBoxDOM key={category.id} category={category} />);
        });
    
        return(
            <main>
                <div className='container maincontainer scrollarea'>
                    <div style={{marginTop: '10px'}}>
                        <section>
                            <div className="m-3">
                                <input type="text" list="datalistOptions" className="form-control" id="searchInput" placeholder="Search" onKeyUp={(e) =>{this.searchInput(e)}}></input>
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
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req, res } = context;
    return {
        props: {
            access_token: req.cookies.access_token
        }
    };
}

export default SearchPage;