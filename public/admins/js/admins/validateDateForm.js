let form = document.getElementsByTagName('form')
let result_date = document.getElementById('resultat_date_result_date')

let submitForm = () => {
    form[0].submit()
}

result_date.addEventListener('change',submitForm)
