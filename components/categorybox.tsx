import Image from "next/future/image";
import { useRouter } from "next/router";
import React from "react";
import { Category } from "../types";
import AuthInstance from "../utilities/auth-instance";
import axiosInstance from "../utilities/axios-instance";

interface CategoryBoxProps {
    category: Category
}

function CategoryBoxDOM(props: CategoryBoxProps) {
    const router = useRouter();

    const navigateToCategoryDetailPage = (event: React.MouseEvent<HTMLDivElement>, category_id: string) => {
        // let requestConfig = {
        //     url: `https://api.spotify.com/v1/browse/categories/${category_id}/playlists`,
        //     headers: {
        //         'Authorization': 'Bearer ' + AuthInstance.access_token,
        //         'Content-Type': 'application/json'
        //     },
        //     method: 'GET'
        // };

        // axiosInstance.request(requestConfig)
        // .then(response => {
        //     console.log(response.data);
        // });
        router.push(`/categories/${category_id}`);
    }

    return(
        <div className="category-box" style={{cursor: 'pointer'}} onClick={(e) => navigateToCategoryDetailPage(e, props.category.id)}>
            <Image src={props.category.icons[0]?.url} alt={props.category.name} width="128" height="128" />
            <div className="category-box-name">
                <span>{props.category.name}</span>
            </div>
        </div>
    )
}

export default CategoryBoxDOM;