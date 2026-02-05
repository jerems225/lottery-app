let payment_type = document.getElementById('withdrawal_payment_type')
let bank = document.getElementById('bank')
let crypto = document.getElementById('asset')
let momo = document.getElementById('momo')

//Fields
let crypto_name = document.getElementById('withdrawal_crypto_name')
let wallet_address = document.getElementById('withdrawal_wallet_address')

let id_card = document.getElementById('withdrawal_id_card')
let bank_name = document.getElementById('withdrawal_bank')
let bank_country = document.getElementById('withdrawal_bank_country')

let momo_operator = document.getElementById('withdrawal_momo_operator')
let phone = document.getElementById('withdrawal_phone')

console.log(payment_type.value)

window.addEventListener('load', hideFields(crypto))
window.addEventListener('load', hideFields(momo))

// window.addEventListener('load', myScript)


//hide some fields when the window load
function hideFields(ob) {
    ob.style.display = 'none'
}

var myScript = () => {
    //show current fields for the select value
    let value = payment_type.value
    if(value == "CRYPTO-MONNAIE")
    {
        crypto.style.display = "flex"
        bank.style.display = "none"
        momo.style.display = "none"

        //make current fields required
        crypto_name.setAttribute('required','required')
        wallet_address.setAttribute('required','required')

        //unrequired bank values
        id_card.removeAttribute('required')
        bank_name.removeAttribute('required')
        bank_country.removeAttribute('required')

        //unrequired momo value
        momo_operator.removeAttribute('required')
        phone.removeAttribute('required')

        //clear bank values
        id_card.value = ''
        bank_name.value = ''
        bank_country.value = ''

        //clear momo values
        momo_operator.value = ''
        phone.value = ''

    }
    else if(value == "MOBILE MONEY")
    {
        crypto.style.display = "none"
        bank.style.display = "none"
        momo.style.display = "flex"

        //make current fields required
        momo_operator.setAttribute('required','required')
        phone.setAttribute('required','required')

        //unrequired bank values
        id_card.removeAttribute('required')
        bank_name.removeAttribute('required')
        bank_country.removeAttribute('required')

        //unrequired crypto values
        crypto_name.removeAttribute('required')
        wallet_address.removeAttribute('required')

        //clear bank value
        id_card.value = ''
        bank_name.value = ''
        bank_country.value = ''

        //clear crypto value
        crypto_name.value = ''
        wallet_address.value = ''
    }
    else if(value == "VIREMENT BANCAIRE")
    {
        crypto.style.display = "none"
        bank.style.display = "flex"
        momo.style.display = "none"

        //make current fields required
        id_card.setAttribute('required','required')
        bank_name.setAttribute('required','required')
        bank_country.setAttribute('required','required')

        //unrequired crypto values
        crypto_name.removeAttribute('required')
        wallet_address.removeAttribute('required')

        //unrequired momo values
        momo_operator.removeAttribute('required')
        phone.removeAttribute('required')

        //clear crypto value
        crypto_name.value = ''
        wallet_address.value = ''

        //clear momo value
        momo_operator.value = ''
        phone.value = ''
    }
}

window.addEventListener('load', myScript)
payment_type.addEventListener("change", myScript)