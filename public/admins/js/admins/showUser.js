let search_user_details = document.getElementById('user_search_details')
let users_elements = document.getElementsByClassName("users")

let users = users_elements[0]
let pseudos = []

window.addEventListener('load', hideUsers())

function hideUsers(){
    for(var index=0 ; index < users_elements.length ; index++)
    {
        pseudos.push(users_elements[index].id)
    }

    pseudos.map((item) => {
        let user_element = document.getElementById(item);
        user_element.style.display = 'none'
    })
}

search_user_details.oninput = function() {
    pseudos.map((item) => {
        if(search_user_details.value != "" && item.search(search_user_details.value) >=0)
        {
            let user_element = document.getElementById(item);
            user_element.style.display = 'flex'
        }
        else
        {
            let user_element = document.getElementById(item);
            user_element.style.display = 'none'
        }
    })
}
