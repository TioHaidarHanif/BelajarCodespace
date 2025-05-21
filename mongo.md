Collection itu tempat nyimpen dokumen. analoginya itu kayak tabel
per dokumen maksimla 16 mb
maksimum level nezsted nya itu 100 level


ada embeded dockumen, jadi kalau di mongodb itu engga perlu bikin tabel baru kalau ada embed data

misal data user, ada data alamat yang ada street, city, country. kalau di rdms itu kan alamat nya dibuat tabel berbeda, tapi di mongo bisa di masukin di collection user aja

tapi bisa aja di pisah collection nya, jadi make nya reference. walaupun engga bisa join, tapi bisa nge filter

misal mau ada colelction user, alamat sama kontak. di collectiojn alamat itu ada reference ke user id, nah user id engga bisa join table ke alamat, jadi caranya itu kita ambil data user, terus ambil data alamat yang user id nya sama. intinya jadi filter lagi sih. 

bedanya embeded sama reference = embeded itu udah tergabung di dalem satu colection. tapi referemnce itu dalam collection terpisaj

struktur data yang dipake mongodb itu sebenernya bson, bukan json
. karena file juga bisa disiompaan di mongodb

apapun yang bisa di json, bisa dilakukan di bson, tapi bson bisa lebih dari json
